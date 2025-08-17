import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useInventory } from '../hooks/useInventory';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '../atoms/Chip';
import { FilterChips } from '../atoms/FilterChips';
import { DateRail } from '../components/DateRail';
import { InlineShowDetails } from '../components/InlineShowDetails';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

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
	const { response, map, isLoading, refetch, timings } = useInventory();

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
							label={dayjs(s.time, 'HH:mm').format('hh:mm A')}
							selected={Boolean(selected)}
							onPress={() => toggleExpand(item.cinemaId, s.time)}
						/>
					);
				})}
			</View>

			{expandedKey && expandedKey.cinemaId === item.cinemaId && (
				<InlineShowDetails
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
					item count {response?.items?.length} · gen{' '}
					{timings.generateMs}ms · reduce {timings.reduceMs}ms · total{' '}
					{timings.totalMs}ms
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
					containerStyle={{
						marginTop: 16,
					}}
				/>

				<DateRail
					data={dates}
					selected={selectedDate}
					onSelect={handleSelectDate}
					containerStyle={{
						marginTop: 16,
						marginBottom: 16,
					}}
					title={'Date'}
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

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#000000' },

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
	},
	timesWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 2, },

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
