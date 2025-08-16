// ShowExplorerScreen.tsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import dayjs from 'dayjs';
import { useInventory } from '../hooks/useInventory';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../atoms/Chip';
import { FilterChips } from '../atoms/FilterChips';

type TTheatreVM = {
	cinemaId: string;
	cinemaName: string;
	shows: Array<{
		time: string;
		price: number;
		available: number;
		seatClasses?: Array<{
			code: string;
			name?: string;
			price: number;
			available: number;
		}>;
	}>;
};

export const RNParserScreen = () => {
	const { map, isLoading, refetch, timings } = useInventory();

	// Selection state
	const languages = useMemo(() => (map ? Object.keys(map) : []), [map]);
	const [selectedLanguage, setSelectedLanguage] = useState<
		string | undefined
	>(undefined);

	const formats = useMemo(
		() =>
			selectedLanguage && map?.[selectedLanguage]
				? Object.keys(map[selectedLanguage])
				: [],
		[map, selectedLanguage],
	);
	const [selectedFormat, setSelectedFormat] = useState<string | undefined>(
		undefined,
	);

	const dates = useMemo(
		() =>
			selectedLanguage && selectedFormat
				? Object.keys(
						map?.[selectedLanguage]?.[selectedFormat] ?? {},
				  ).sort()
				: [],
		[map, selectedLanguage, selectedFormat],
	);
	const [selectedDate, setSelectedDate] = useState<string | undefined>(
		undefined,
	);

	// add near other useState declarations
	const [expandedKey, setExpandedKey] = useState<{
		cinemaId: string;
		time: string;
	} | null>(null);

	// handlers that invalidate deeper selections
	const handleSelectLanguage = useCallback((lang: string) => {
		setSelectedLanguage(lang);
		setSelectedFormat(undefined); // invalidate deeper
		setSelectedDate(undefined); // invalidate deeper
		setExpandedKey(null); // collapse details
	}, []);

	const handleSelectFormat = useCallback((fmt: string) => {
		setSelectedFormat(fmt);
		setSelectedDate(undefined); // invalidate deeper
		setExpandedKey(null); // collapse details
	}, []);

	const handleSelectDate = useCallback((d: string) => {
		setSelectedDate(d);
		setExpandedKey(null); // collapse details
	}, []);

	useEffect(() => {
		if (languages.length && !selectedLanguage)
			setSelectedLanguage(languages[0]);
	}, [languages, selectedLanguage]);

	useEffect(() => {
		if (!selectedLanguage) return;
		if (formats.length === 0) {
			setSelectedFormat(undefined);
			return;
		}
		if (!selectedFormat || !formats.includes(selectedFormat)) {
			setSelectedFormat(formats[0]);
		}
	}, [selectedLanguage, formats, selectedFormat]);

	useEffect(() => {
		if (!selectedLanguage || !selectedFormat) return;
		if (dates.length === 0) {
			setSelectedDate(undefined);
			return;
		}
		if (!selectedDate || !dates.includes(selectedDate)) {
			setSelectedDate(dates[0]);
		}
	}, [selectedLanguage, selectedFormat, dates, selectedDate]);

	const theatres: TTheatreVM[] = useMemo(() => {
		if (!map || !selectedLanguage || !selectedFormat || !selectedDate)
			return [];
		const node =
			map[selectedLanguage]?.[selectedFormat]?.[selectedDate] ?? {};
		return Object.entries(node).map(([cinemaId, val]) => ({
			cinemaId,
			cinemaName: val.cinemaName,
			shows: Object.entries(val.shows)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([time, s]) => ({
					time,
					price: s.price,
					available: s.availableSeats,
					seatClasses: s.seatClasses,
				})),
		}));
	}, [map, selectedLanguage, selectedFormat, selectedDate]);

	const toggleExpand = useCallback((cinemaId: string, time: string) => {
		setExpandedKey((k) =>
			k && k.cinemaId === cinemaId && k.time === time
				? null
				: { cinemaId, time },
		);
	}, []);

	const loadingUI = (
		<View style={styles.loadingWrap}>
			<ActivityIndicator />
			<Text style={styles.loadingText}>Loading inventory…</Text>
		</View>
	);

	const emptyUI = (
		<View style={styles.emptyWrap}>
			<Text style={styles.emptyTitle}>No shows found</Text>
			<Pressable onPress={refetch} style={styles.retryBtn}>
				<Text style={styles.retryText}>Retry</Text>
			</Pressable>
		</View>
	);

	const DateRail = ({
		days,
		selected,
		onSelect,
	}: {
		days: string[];
		selected?: string;
		onSelect: (d: string) => void;
	}) => (
		<View style={styles.filterSection}>
			<Text style={styles.filterTitle}>Date</Text>
			<FlatList
				data={days}
				keyExtractor={(d) => d}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.chipsRow}
				renderItem={({ item }) => {
					const label = dayjs(item).format('ddd D');
					return (
						<Chip
							label={label}
							selected={selected === item}
							onPress={() => onSelect(item)}
						/>
					);
				}}
			/>
		</View>
	);

	const TheatreCard = ({ item }: { item: TTheatreVM }) => (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>{item.cinemaName}</Text>
			<View style={styles.timesWrap}>
				{item.shows.map((s) => {
					const selected =
						expandedKey &&
						expandedKey.cinemaId === item.cinemaId &&
						expandedKey.time === s.time;
					return (
						<Chip
							key={s.time}
							label={s.time}
							selected={Boolean(selected)}
							onPress={() => toggleExpand(item.cinemaId, s.time)}
						/>
					);
				})}
			</View>

			{expandedKey && expandedKey.cinemaId === item.cinemaId && (
				<ShowDetailInline
					show={item.shows.find((s) => s.time === expandedKey.time)!}
				/>
			)}
		</View>
	);

	const contentUI = (
		<SafeAreaView style={styles.container}>
			{/* Benchmark bar */}
			<View style={styles.hud}>
				<Text style={styles.hudText}>
					gen {timings.generateMs}ms · reduce {timings.reduceMs}ms ·
					total {timings.totalMs}ms
				</Text>
			</View>

			{/* Filters */}
			<View style={styles.filtersSticky}>
				<FilterChips
					title='Language'
					data={languages}
					selected={selectedLanguage}
					onSelect={handleSelectLanguage}
				/>

				<FilterChips
					title='Format'
					data={formats}
					selected={selectedFormat}
					onSelect={handleSelectFormat}
				/>

				<DateRail
					days={dates}
					selected={selectedDate}
					onSelect={handleSelectDate}
				/>
			</View>

			{/* List */}
			{theatres.length === 0 ? (
				emptyUI
			) : (
				<FlatList
					data={theatres}
					keyExtractor={(t) => t.cinemaId}
					renderItem={({ item }) => <TheatreCard item={item} />}
					contentContainerStyle={styles.listContent}
				/>
			)}
		</SafeAreaView>
	);

	if (isLoading || !map) return loadingUI;
	return contentUI;
};

function ShowDetailInline({
	show,
}: {
	show: {
		time: string;
		price: number;
		available: number;
		seatClasses?: Array<{
			code: string;
			name?: string;
			price: number;
			available: number;
		}>;
	};
}) {
	return (
		<View style={styles.detailBox}>
			<View style={styles.detailRow}>
				<Text style={styles.detailKey}>Price</Text>
				<Text style={styles.detailVal}>₹{show?.price}</Text>
			</View>
			<View style={styles.detailRow}>
				<Text style={styles.detailKey}>Available</Text>
				<Text style={styles.detailVal}>{show?.available}</Text>
			</View>

			{show.seatClasses && show.seatClasses.length > 0 && (
				<View style={styles.seatClassWrap}>
					{show.seatClasses.map((c) => (
						<View key={c.code} style={styles.seatClassRow}>
							<Text style={styles.seatClassName}>
								{c.name ?? c.code}
							</Text>
							<Text style={styles.seatClassPrice}>
								₹{c.price}
							</Text>
							<Text style={styles.seatClassAvail}>
								{c.available} left
							</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#0a0a0a' },

	// Benchmark HUD
	hud: {
		paddingHorizontal: 12,
		paddingTop: 10,
		paddingBottom: 6,
		backgroundColor: '#0a0a0a',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#222',
	},
	hudText: { color: '#9dd0ff', fontSize: 12 },

	filtersSticky: {
		paddingTop: 10,
		paddingBottom: 4,
		paddingHorizontal: 12,
		backgroundColor: '#0a0a0a',
	},
	filterSection: { marginBottom: 8 },
	filterTitle: { color: '#bdbdbd', fontSize: 12, marginBottom: 6 },
	chipsRow: { gap: 8 },

	listContent: { padding: 12, paddingBottom: 24 },
	card: {
		backgroundColor: '#141414',
		borderRadius: 12,
		padding: 12,
		marginBottom: 12,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: '#262626',
	},
	cardTitle: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 8,
	},
	timesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

	detailBox: {
		marginTop: 10,
		backgroundColor: '#0f0f0f',
		borderRadius: 10,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: '#2a2a2a',
		padding: 10,
	},
	detailRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 6,
	},
	detailKey: { color: '#a3a3a3', fontSize: 13 },
	detailVal: { color: '#fff', fontSize: 14, fontWeight: '600' },

	seatClassWrap: { marginTop: 8, gap: 6 },
	seatClassRow: { flexDirection: 'row', justifyContent: 'space-between' },
	seatClassName: { color: '#eaeaea', fontSize: 13 },
	seatClassPrice: { color: '#eaeaea', fontSize: 13 },
	seatClassAvail: { color: '#bdbdbd', fontSize: 12 },

	loadingWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 24,
		backgroundColor: '#0a0a0a',
	},
	loadingText: { color: '#cfcfcf', marginTop: 8 },

	emptyWrap: { alignItems: 'center', padding: 24 },
	emptyTitle: { color: '#cfcfcf', marginBottom: 8 },
	retryBtn: {
		backgroundColor: '#1f6feb',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 8,
	},
	retryText: { color: 'white', fontWeight: '600' },
});
