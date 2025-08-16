// inventory.ts
import dayjs from 'dayjs';
import {
	ICinemaMeta,
	IInventoryResponse,
	IShowInventoryItem,
	TInventoryMap,
} from '../types/inventoryTypes';

export type TGenerateBackendParams = {
	languagesCount: number;
	formatsPerLanguage: number;
	dateStart: string; // YYYY-MM-DD
	dateEnd: string; // YYYY-MM-DD
	cinemasCount: number;
	showsPerCinemaPerDay: number;
	seed?: number; // deterministic
	currency?: string; // default "INR"
	basePriceINR?: number; // default 200
	priceJitterPct?: number; // default 0.2 (±20%)
	minSeatsPerShow?: number; // default 60
	maxSeatsPerShow?: number; // default 180
	showtimeWindow?: { start: string; end: string }; // default 09:00–23:00
	includeSeatClasses?: boolean; // default false
};

export const generateBackendInventory = ({
	languagesCount,
	formatsPerLanguage,
	dateStart,
	dateEnd,
	cinemasCount,
	showsPerCinemaPerDay,
	seed = 42,
	currency = 'INR',
	basePriceINR = 200,
	priceJitterPct = 0.2,
	minSeatsPerShow = 60,
	maxSeatsPerShow = 180,
	showtimeWindow = { start: '09:00', end: '23:00' },
	includeSeatClasses = false,
}: TGenerateBackendParams): IInventoryResponse => {
	// PRNG (mulberry32)
	let s = seed >>> 0;
	const rnd = () => {
		s += 0x6d2b79f5;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
	const randInt = (min: number, max: number) =>
		Math.floor(rnd() * (max - min + 1)) + min;
	const pick = <T>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];

	// Languages & formats
	const langPool = [
		['en', 'English'],
		['hi', 'Hindi'],
		['ta', 'Tamil'],
		['te', 'Telugu'],
		['ml', 'Malayalam'],
		['mr', 'Marathi'],
		['kn', 'Kannada'],
		['bn', 'Bengali'],
		['pa', 'Punjabi'],
		['gu', 'Gujarati'],
	] as const;

	const formatPool = [
		['2d', '2D'],
		['3d', '3D'],
		['imax', 'IMAX'],
		['4dx', '4DX'],
		['screenx', 'ScreenX'],
	] as const;

	const languages = Array.from({ length: languagesCount }, (_, i) => {
		const [code, name] = langPool[i % langPool.length];
		return { code: i < langPool.length ? code : `l${i + 1}`, name };
	});

	const formatsByLang: Record<string, { code: string; name: string }[]> = {};
	languages.forEach((l, li) => {
		formatsByLang[l.code] = Array.from(
			{ length: formatsPerLanguage },
			(_, fi) => {
				const [code, name] = formatPool[(li + fi) % formatPool.length];
				return {
					code:
						formatsPerLanguage <= formatPool.length
							? code
							: `f${fi + 1}`,
					name,
				};
			},
		);
	});

	// Cinemas
	const cinemaChains = ['PVR', 'INOX', 'Cinepolis', 'Miraj', 'Carnival'];
	const cityPool = [
		'Bengaluru',
		'Mumbai',
		'Delhi',
		'Hyderabad',
		'Chennai',
		'Pune',
	];
	const cinemas: Record<string, ICinemaMeta> = {};
	for (let i = 0; i < cinemasCount; i++) {
		const id = `cin_${String(i + 1).padStart(3, '0')}`;
		cinemas[id] = {
			name: `${pick(cinemaChains)} ${pick([
				'Orion',
				'Phoenix',
				'Forum',
				'City Centre',
				'Mall',
			])} #${i + 1}`,
			city: pick(cityPool),
		};
	}

	// Dates
	const start = dayjs(dateStart, 'YYYY-MM-DD');
	const end = dayjs(dateEnd, 'YYYY-MM-DD');
	const days = end.diff(start, 'day');
	const dateList: string[] = Array.from({ length: days + 1 }, (_, d) =>
		start.add(d, 'day').format('YYYY-MM-DD'),
	);

	// Showtimes spacing
	const [wStartH, wStartM] = showtimeWindow.start.split(':').map(Number);
	const [wEndH, wEndM] = showtimeWindow.end.split(':').map(Number);
	const winStartMin = wStartH * 60 + wStartM;
	const winEndMin = wEndH * 60 + wEndM;
	const totalWindow = Math.max(1, winEndMin - winStartMin);
	const gap = Math.max(
		60,
		Math.floor(totalWindow / (showsPerCinemaPerDay + 1)),
	); // ≥60 min

	const mkShowTimes = () => {
		const times: string[] = [];
		let cur = winStartMin + Math.floor(gap * 0.6); // slight offset
		for (let i = 0; i < showsPerCinemaPerDay; i++) {
			const jitter = randInt(-10, 10); // ±10 min jitter
			const min = Math.min(
				winEndMin - 1,
				Math.max(winStartMin, cur + jitter),
			);
			const hh = String(Math.floor(min / 60)).padStart(2, '0');
			const mm = String(min % 60).padStart(2, '0');
			times.push(`${hh}:${mm}`);
			cur += gap;
		}
		return Array.from(new Set(times));
	};

	// Price multiplier by format
	const formatMultiplier: Record<string, number> = {
		'2d': 1.0,
		'3d': 1.2,
		imax: 1.4,
		'4dx': 1.5,
		screenx: 1.3,
	};

	const items: IShowInventoryItem[] = [];
	for (const lang of languages) {
		const formats = formatsByLang[lang.code];
		for (const fmt of formats) {
			for (const date of dateList) {
				for (const cinemaId of Object.keys(cinemas)) {
					const showTimes = mkShowTimes();
					for (let si = 0; si < showTimes.length; si++) {
						const time = showTimes[si];
						const cap = randInt(minSeatsPerShow, maxSeatsPerShow);
						const avail = randInt(Math.floor(cap * 0.2), cap); // 20%..100%
						const mul = formatMultiplier[fmt.code] ?? 1.0;
						const jitter = 1 + (rnd() * 2 - 1) * priceJitterPct; // ±pct
						const price =
							Math.round((basePriceINR * mul * jitter) / 5) * 5; // round to ₹5

						const showId =
							`show_${lang.code}_${fmt.code}_${date}_${cinemaId}_${time}`.replace(
								/[^a-zA-Z0-9_]/g,
								'',
							);
						const auditorium = `Audi ${randInt(1, 7)}`;
						const screenType = fmt.name;

						const row: IShowInventoryItem = {
							languageCode: lang.code,
							formatCode: fmt.code,
							date,
							cinemaId,
							cinemaName: cinemas[cinemaId]?.name,
							showId,
							showTime: time,
							basePrice: price,
							availableSeats: avail,
							capacity: cap,
							auditorium,
							screenType,
							lastUpdatedIso: new Date().toISOString(),
						};

						if (includeSeatClasses) {
							const silver = Math.max(0, Math.floor(avail * 0.5));
							const gold = Math.max(0, Math.floor(avail * 0.3));
							const platinum = Math.max(0, avail - silver - gold);
							row.seatClasses = [
								{
									code: 'silver',
									name: 'Silver',
									price: price,
									available: silver,
								},
								{
									code: 'gold',
									name: 'Gold',
									price: Math.round((price * 1.15) / 5) * 5,
									available: gold,
								},
								{
									code: 'platinum',
									name: 'Platinum',
									price: Math.round((price * 1.3) / 5) * 5,
									available: platinum,
								},
							];
						}

						items.push(row);
					}
				}
			}
		}
	}

	const languagesDict = Object.fromEntries(
		languages.map((l) => [l.code, l.name]),
	);
	const formatsDict = Object.values(formatsByLang)
		.flat()
		.reduce<Record<string, string>>((acc, f) => {
			acc[f.code] = f.name;
			return acc;
		}, {});

	return {
		currency,
		generatedAtIso: new Date().toISOString(),
		dictionaries: {
			languages: languagesDict,
			formats: formatsDict,
			cinemas,
		},
		items,
	};
};

// ===== Function 2: Reduce backend response into nested map =====
export const buildInventoryMap = (resp: IInventoryResponse): TInventoryMap => {
	const map: TInventoryMap = {};

	const cinemaNameOf = (id: string, fallback?: string) =>
		resp.dictionaries?.cinemas?.[id]?.name ?? fallback ?? id;

	for (const it of resp.items) {
		const lang = it.languageCode;
		const fmt = it.formatCode;
		const date = it.date;
		const cin = it.cinemaId;
		const time = it.showTime;

		if (!map[lang]) map[lang] = {};
		if (!map[lang][fmt]) map[lang][fmt] = {};
		if (!map[lang][fmt][date]) map[lang][fmt][date] = {};
		if (!map[lang][fmt][date][cin]) {
			map[lang][fmt][date][cin] = {
				cinemaName: cinemaNameOf(cin, it.cinemaName),
				shows: {},
			};
		}

		map[lang][fmt][date][cin].shows[time] = {
			price: it.basePrice,
			availableSeats: it.availableSeats,
			...(it.seatClasses ? { seatClasses: it.seatClasses } : {}),
		};
	}

	return map;
};
