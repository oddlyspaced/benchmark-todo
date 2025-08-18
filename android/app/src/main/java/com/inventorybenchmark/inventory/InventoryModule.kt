package com.inventorybenchmark.inventory

import android.os.SystemClock
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.oddlyspaced.inventory.benchmark.NativeInventorySpec
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

class InventoryModule(reactContext: ReactApplicationContext) : NativeInventorySpec(reactContext) {

    companion object {
        const val NAME = "NativeInventory"
    }

    // ---------- RN Module Id ----------
    override fun getName() = NAME

    // ---------- In-memory dataset registry ----------
    private val datasets = mutableMapOf<String, Dataset>()

    // ---------- API: generate + index ----------
    override fun generateAndIndex(params: ReadableMap?, options: ReadableMap?, promise: Promise?) {
        try {
            requireNotNull(params) { "params is required" }

            val p = GenerateParams.fromReadableMap(params)
            val datasetId = options?.getString("datasetId") ?: "ds_${Random.nextInt().toUInt().toString(16)}"

            val t0 = SystemClock.elapsedRealtime()

            // 1) Generate + Reduce → Nested Map
            val genResult = generateAndReduce(p)

            val t1 = SystemClock.elapsedRealtime()

            // 2) Build indexes for fast getters
            val indexes = buildIndexes(genResult.map)

            val t2 = SystemClock.elapsedRealtime()

            val timings = Timings(
                generateMs = (t1 - t0).toInt(),
                reduceMs = 0,                   // generation already included reduction; keep for parity
                indexMs = (t2 - t1).toInt(),
                totalMs = (t2 - t0).toInt()
            )

            val dataset = Dataset(
                params = p,
                map = genResult.map,
                indexes = indexes,
                timings = timings,
                counts = Counts(items = genResult.items, days = genResult.days)
            )
            datasets[datasetId] = dataset

            val out = Arguments.createMap().apply {
                putString("datasetId", datasetId)
                putMap("timings", timings.toWritableMap())
                putMap("counts", dataset.counts.toWritableMap())
            }
            promise?.resolve(out)
        } catch (t: Throwable) {
            promise?.reject("E_GENERATE", t.message, t)
        }
    }

    // ---------- API: getters ----------
    override fun getLanguages(datasetId: String?, promise: Promise?) {
        try {
            val ds = datasets[requireNotNull(datasetId) { "datasetId is required" }]
                ?: error("Dataset not found")
            val arr = Arguments.createArray()
            ds.indexes.languages.forEach { arr.pushString(it) }
            promise?.resolve(arr)
        } catch (t: Throwable) {
            promise?.reject("E_LANG", t.message, t)
        }
    }

    override fun getFormats(datasetId: String?, languageCode: String?, promise: Promise?) {
        try {
            val ds = datasets[requireNotNull(datasetId) { "datasetId is required" }]
                ?: error("Dataset not found")
            val lang = requireNotNull(languageCode) { "languageCode is required" }
            val list = ds.indexes.formatsByLanguage[lang] ?: emptyList()
            val arr = Arguments.createArray()
            list.forEach { arr.pushString(it) }
            promise?.resolve(arr)
        } catch (t: Throwable) {
            promise?.reject("E_FMT", t.message, t)
        }
    }

    override fun getDates(datasetId: String?, languageCode: String?, formatCode: String?, promise: Promise?) {
        try {
            val ds = datasets[requireNotNull(datasetId) { "datasetId is required" }]
                ?: error("Dataset not found")
            val lang = requireNotNull(languageCode) { "languageCode is required" }
            val fmt = requireNotNull(formatCode) { "formatCode is required" }
            val list = ds.indexes.datesByLangFormat["$lang::$fmt"] ?: emptyList()
            val arr = Arguments.createArray()
            list.forEach { arr.pushString(it) }
            promise?.resolve(arr)
        } catch (t: Throwable) {
            promise?.reject("E_DATE", t.message, t)
        }
    }

    override fun getInventoryFor(
        datasetId: String?,
        languageCode: String?,
        formatCode: String?,
        date: String?,
        promise: Promise?
    ) {
        try {
            val ds = datasets[requireNotNull(datasetId) { "datasetId is required" }]
                ?: error("Dataset not found")
            val lang = requireNotNull(languageCode) { "languageCode is required" }
            val fmt = requireNotNull(formatCode) { "formatCode is required" }
            val day = requireNotNull(date) { "date is required" }

            val dayNode = ds.map[lang]?.get(fmt)?.get(day) ?: emptyMap()

            val theatresArray = Arguments.createArray()
            var showCount = 0
            // Stable iteration by cinemaName then id
            val sortedCinemas = dayNode.entries.sortedWith(
                compareBy<Map.Entry<String, CinemaNode>>({ it.value.cinemaName.lowercase(Locale.ROOT) }, { it.key })
            )

            for ((cinemaId, cinemaNode) in sortedCinemas) {
                val showsArr = Arguments.createArray()
                val sortedShows = cinemaNode.shows.entries.sortedBy { it.key } // by "HH:mm"
                for ((time, info) in sortedShows) {
                    val showMap = Arguments.createMap().apply {
                        putString("time", time)
                        putInt("price", info.price)
                        putInt("available", info.availableSeats)
                        info.seatClasses?.let { sc ->
                            val scArr = Arguments.createArray()
                            for (c in sc) {
                                scArr.pushMap(Arguments.createMap().apply {
                                    putString("code", c.code)
                                    c.name?.let { putString("name", it) }
                                    putInt("price", c.price)
                                    putInt("available", c.available)
                                })
                            }
                            putArray("seatClasses", scArr)
                        }
                    }
                    showsArr.pushMap(showMap)
                }
                showCount += sortedShows.size

                val theatreMap = Arguments.createMap().apply {
                    putString("cinemaId", cinemaId)
                    putString("cinemaName", cinemaNode.cinemaName)
                    putArray("shows", showsArr)
                }
                theatresArray.pushMap(theatreMap)
            }

            val result = Arguments.createMap().apply {
                putString("languageCode", lang)
                putString("formatCode", fmt)
                putString("date", day)
                putArray("theatres", theatresArray)
                putMap("meta", Arguments.createMap().apply {
                    putInt("theatres", dayNode.size)
                    putInt("shows", showCount)
                })
            }
            promise?.resolve(result)
        } catch (t: Throwable) {
            promise?.reject("E_SLICE", t.message, t)
        }
    }

    override fun destroyDataset(datasetId: String?, promise: Promise?) {
        try {
            val id = requireNotNull(datasetId) { "datasetId is required" }
            datasets.remove(id)
            promise?.resolve(null)
        } catch (t: Throwable) {
            promise?.reject("E_DESTROY", t.message, t)
        }
    }

    // ---------- Generation & Reduction ----------

    private fun generateAndReduce(p: GenerateParams): GenResult {
        // Pools
        val langPool = listOf(
            "en" to "English", "hi" to "Hindi", "ta" to "Tamil",
            "te" to "Telugu", "ml" to "Malayalam", "mr" to "Marathi",
            "kn" to "Kannada", "bn" to "Bengali", "pa" to "Punjabi", "gu" to "Gujarati"
        )
        val fmtPool = listOf("2d", "3d", "imax", "4dx", "screenx")
        val chains = listOf("PVR", "INOX", "Cinepolis", "Miraj", "Carnival")
        val malls = listOf("Orion", "Phoenix", "Forum", "City Centre", "Mall")
        val cities = listOf("Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune")

        // Deterministic RNG
        val rng = RNG(p.seed)

        // Build languages & formats per language
        val languages: List<String> = (0 until p.languagesCount).map { i ->
            if (i < langPool.size) langPool[i].first else "l${i + 1}"
        }

        val formatsByLang: MutableMap<String, List<String>> = mutableMapOf()
        languages.forEachIndexed { li, lang ->
            val fmts = (0 until p.formatsPerLanguage).map { fi ->
                val base = fmtPool[(li + fi) % fmtPool.size]
                if (p.formatsPerLanguage <= fmtPool.size) base else "f${fi + 1}"
            }
            formatsByLang[lang] = fmts
        }

        // Cinemas
        val cinemas: Map<String, String> = (0 until p.cinemasCount).associate { i ->
            val id = "cin_${(i + 1).toString().padStart(3, '0')}"
            val name = "${chains[rng.pick(chains.indices)]} ${malls[rng.pick(malls.indices)]} #${i + 1}"
            id to name
        }

        // Dates inclusive
        val dateList = buildDateList(p.dateStart, p.dateEnd)
        val days = dateList.size

        // Showtimes window + spacing
        val winStart = parseMinutes(p.showtimeStart)
        val winEnd = parseMinutes(p.showtimeEnd)
        val totalWindow = max(1, winEnd - winStart)
        val gap = max(60, totalWindow / (p.showsPerCinemaPerDay + 1))
        fun makeShowTimes(): List<String> {
            val out = linkedSetOf<String>()
            var cur = winStart + (gap * 6) / 10 // slight offset
            repeat(p.showsPerCinemaPerDay) {
                val jitter = rng.int(-10, 10)
                val m = min(winEnd - 1, max(winStart, cur + jitter))
                out.add("${(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}")
                cur += gap
            }
            return out.toList()
        }

        val fmtMultiplier = mapOf("2d" to 1.0, "3d" to 1.2, "imax" to 1.4, "4dx" to 1.5, "screenx" to 1.3)

        // Nested map we build into
        val root: MutableMap<String, MutableMap<String, MutableMap<String, MutableMap<String, CinemaNode>>>> =
            mutableMapOf()

        var itemCount = 0

        for (lang in languages) {
            val fmts = formatsByLang[lang].orEmpty()
            for (fmt in fmts) {
                for (date in dateList) {
                    for ((cinemaId, cinemaName) in cinemas) {
                        val showTimes = makeShowTimes()
                        for (time in showTimes) {
                            val cap = rng.int(p.minSeatsPerShow, p.maxSeatsPerShow)
                            val avail = rng.int((cap * 0.2).toInt(), cap)
                            val mul = fmtMultiplier[fmt] ?: 1.0
                            val jitter = 1.0 + ((rng.float() * 2.0) - 1.0) * p.priceJitterPct
                            val price = ((p.basePriceINR * mul * jitter) / 5.0).roundTo5()

                            val seatClasses = if (p.includeSeatClasses) {
                                val silver = max(0, (avail * 0.5).toInt())
                                val gold = max(0, (avail * 0.3).toInt())
                                val platinum = max(0, avail - silver - gold)
                                listOf(
                                    SeatClass("silver", "Silver", price, silver),
                                    SeatClass("gold", "Gold", (price * 1.15).roundTo5(), gold),
                                    SeatClass("platinum", "Platinum", (price * 1.30).roundTo5(), platinum),
                                )
                            } else null

                            val show = ShowInfo(price = price, availableSeats = avail, seatClasses = seatClasses)

                            val fmtNode = root.getOrPut(lang) { mutableMapOf() }
                                .getOrPut(fmt) { mutableMapOf() }
                                .getOrPut(date) { mutableMapOf() }

                            val cinemaNode = fmtNode.getOrPut(cinemaId) { CinemaNode(cinemaName, mutableMapOf()) }
                            cinemaNode.shows[time] = show

                            itemCount++
                        }
                    }
                }
            }
        }

        return GenResult(map = root, items = itemCount, days = days)
    }

    private fun buildIndexes(
        map: Map<String, Map<String, Map<String, Map<String, CinemaNode>>>>
    ): Indexes {
        val languages = map.keys.sorted()

        val formatsByLanguage = mutableMapOf<String, List<String>>()
        val datesByLangFormat = mutableMapOf<String, List<String>>()

        for ((lang, fmts) in map) {
            val fmtList = fmts.keys.sorted()
            formatsByLanguage[lang] = fmtList
            for ((fmt, dates) in fmts) {
                val dateList = dates.keys.sorted()
                datesByLangFormat["$lang::$fmt"] = dateList
            }
        }

        return Indexes(
            languages = languages,
            formatsByLanguage = formatsByLanguage,
            datesByLangFormat = datesByLangFormat
        )
    }

    // ---------- Utils & Models ----------

    private data class GenerateParams(
        val languagesCount: Int,
        val formatsPerLanguage: Int,
        val dateStart: String,
        val dateEnd: String,
        val cinemasCount: Int,
        val showsPerCinemaPerDay: Int,
        val includeSeatClasses: Boolean,
        val seed: Int,
        val basePriceINR: Int,
        val priceJitterPct: Double,
        val minSeatsPerShow: Int,
        val maxSeatsPerShow: Int,
        val showtimeStart: String,
        val showtimeEnd: String
    ) {
        companion object {
            fun fromReadableMap(m: ReadableMap): GenerateParams {
                fun ReadableMap.getIntOr(key: String, def: Int) =
                    if (hasKey(key)) getInt(key) else def

                fun ReadableMap.getDoubleOr(key: String, def: Double) =
                    if (hasKey(key)) getDouble(key) else def

                fun ReadableMap.getBooleanOr(key: String, def: Boolean) =
                    if (hasKey(key)) getBoolean(key) else def

                fun ReadableMap.getStringOr(key: String, def: String) =
                    if (hasKey(key)) getString(key) ?: def else def

                val showtime = if (m.hasKey("showtimeWindow")) m.getMap("showtimeWindow") else null
                val startStr = showtime?.getString("start") ?: "09:00"
                val endStr = showtime?.getString("end") ?: "23:00"

                return GenerateParams(
                    languagesCount = m.getIntOr("languagesCount", 3),
                    formatsPerLanguage = m.getIntOr("formatsPerLanguage", 3),
                    dateStart = m.getStringOr("dateStart", "2025-08-17"),
                    dateEnd = m.getStringOr("dateEnd", "2025-08-23"),
                    cinemasCount = m.getIntOr("cinemasCount", 6),
                    showsPerCinemaPerDay = m.getIntOr("showsPerCinemaPerDay", 5),
                    includeSeatClasses = m.getBooleanOr("includeSeatClasses", false),
                    seed = m.getIntOr("seed", 42),
                    basePriceINR = m.getIntOr("basePriceINR", 200),
                    priceJitterPct = m.getDoubleOr("priceJitterPct", 0.2),
                    minSeatsPerShow = m.getIntOr("minSeatsPerShow", 60),
                    maxSeatsPerShow = m.getIntOr("maxSeatsPerShow", 180),
                    showtimeStart = startStr,
                    showtimeEnd = endStr
                )
            }
        }
    }

    private data class GenResult(
        val map: MutableMap<String, MutableMap<String, MutableMap<String, MutableMap<String, CinemaNode>>>>,
        val items: Int,
        val days: Int
    )

    private data class Counts(val items: Int, val days: Int) {
        fun toWritableMap(): WritableMap = Arguments.createMap().apply {
            putInt("items", items); putInt("days", days)
        }
    }

    private data class Timings(val generateMs: Int, val reduceMs: Int, val indexMs: Int, val totalMs: Int) {
        fun toWritableMap(): WritableMap = Arguments.createMap().apply {
            putInt("generateMs", generateMs)
            putInt("reduceMs", reduceMs)
            putInt("indexMs", indexMs)
            putInt("totalMs", totalMs)
        }
    }

    private data class Indexes(
        val languages: List<String>,
        val formatsByLanguage: Map<String, List<String>>,
        val datesByLangFormat: Map<String, List<String>>
    )

    private data class SeatClass(val code: String, val name: String?, val price: Int, val available: Int)
    private data class ShowInfo(val price: Int, val availableSeats: Int, val seatClasses: List<SeatClass>?)
    private data class CinemaNode(val cinemaName: String, val shows: MutableMap<String, ShowInfo>)

    private data class Dataset(
        val params: GenerateParams,
        val map: MutableMap<String, MutableMap<String, MutableMap<String, MutableMap<String, CinemaNode>>>>,
        val indexes: Indexes,
        val timings: Timings,
        val counts: Counts
    )

    private class RNG(seedIn: Int) {
        private var state: Int = if (seedIn == 0) 0x9E3779B9.toInt() else seedIn
        fun float(): Double {
            var x = state
            x = x xor (x shl 13)
            x = x xor (x ushr 17)
            x = x xor (x shl 5)
            state = x
            // Convert to [0,1)
            val u = x.toLong() and 0xFFFFFFFFL
            return u.toDouble() / 4294967296.0
        }

        fun int(min: Int, max: Int): Int {
            if (min >= max) return min
            val f = float()
            return (min + (f * ((max - min) + 1)).toInt()).coerceIn(min, max)
        }

        fun pick(range: IntRange): Int = int(range.first, range.last)
    }

    private fun Double.roundTo5(): Int {
        val v = this
        return (kotlin.math.round(v / 5.0) * 5.0).toInt()
    }

    private fun parseMinutes(hhmm: String): Int {
        val parts = hhmm.split(":")
        val h = parts.getOrNull(0)?.toIntOrNull() ?: 0
        val m = parts.getOrNull(1)?.toIntOrNull() ?: 0
        return h * 60 + m
    }

    private fun buildDateList(start: String, end: String): List<String> {
        val fmt = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
            isLenient = false
        }
        val startDate = fmt.parse(start) ?: error("Invalid dateStart")
        val endDate = fmt.parse(end) ?: error("Invalid dateEnd")
        val out = mutableListOf<String>()
        var cur = startDate.time
        val endMs = endDate.time
        val oneDay = 86_400_000L
        if (cur > endMs) error("dateEnd must be >= dateStart")
        while (cur <= endMs) {
            out.add(fmt.format(cur))
            cur += oneDay
        }
        return out
    }
}