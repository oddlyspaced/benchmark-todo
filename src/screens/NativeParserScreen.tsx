// NativeParserScreen.tsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import { Chip } from '../atoms/Chip';
import { FilterChips } from '../atoms/FilterChips';
import { DateRail } from '../components/DateRail';
import { InlineShowDetails } from '../components/InlineShowDetails';
import NativeInventory from '../specs/NativeInventory';
import { StackNavigationProp } from '@react-navigation/stack';
import { TNavigationRouterProps } from '../navigation/NavigationRouterProps';
import { RouteProp } from '@react-navigation/native';

type TSeatClass = {
	code: string;
	name?: string;
	price: number;
	available: number;
};
type TShowVM = {
	time: string;
	price: number;
	available: number;
	seatClasses?: TSeatClass[];
};
type TTheatreVM = { cinemaId: string; cinemaName: string; shows: TShowVM[] };

type TNavigationProps = StackNavigationProp<
	TNavigationRouterProps,
	'NativeParserScreen'
>;
type TRouteProps = RouteProp<TNavigationRouterProps, 'NativeParserScreen'>;

interface INativeParserScreenProps {
	navigation: TNavigationProps;
	route: TRouteProps;
}

export const NativeParserScreen = ({ route }: INativeParserScreenProps) => {
	// dataset lifecycle

	const { params } = route?.params;

	const [datasetId, setDatasetId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [timings, setTimings] = useState<{
		generateMs: number;
		reduceMs: number;
		indexMs: number;
		totalMs: number;
	}>({
		generateMs: 0,
		reduceMs: 0,
		indexMs: 0,
		totalMs: 0,
	});
	const [counts, setCounts] = useState<{
		items: number;
		days: number;
	} | null>(null);

	// selections + options
	const [languages, setLanguages] = useState<string[]>([]);
	const [selectedLanguage, setSelectedLanguage] = useState<
		string | undefined
	>(undefined);

	const [formats, setFormats] = useState<string[]>([]);
	const [selectedFormat, setSelectedFormat] = useState<string | undefined>(
		undefined,
	);

	const [dates, setDates] = useState<string[]>([]);
	const [selectedDate, setSelectedDate] = useState<string | undefined>(
		undefined,
	);

	const [theatres, setTheatres] = useState<TTheatreVM[]>([]);

	// inline expander
	const [expandedKey, setExpandedKey] = useState<{
		cinemaId: string;
		time: string;
	} | null>(null);
	const toggleExpand = useCallback((cinemaId: string, time: string) => {
		setExpandedKey((k) =>
			k && k.cinemaId === cinemaId && k.time === time
				? null
				: { cinemaId, time },
		);
	}, []);

	// --- dataset bootstrap (generate + index native side)
	const boot = useCallback(async () => {
		setIsLoading(true);
		setExpandedKey(null);
		try {
			// Clean existing dataset if any
			if (datasetId) {
				try {
					await NativeInventory.destroyDataset(datasetId);
				} catch {
					/* ignore */
				}
			}
			const {
				datasetId: id,
				timings,
				counts,
			} = await NativeInventory.generateAndIndex(
				{
					languagesCount: parseInt(params?.languagesCount),
					formatsPerLanguage: parseInt(params?.formatsPerLanguage),
					dateStart: params?.dateStart,
					dateEnd: params?.dateEnd,
					cinemasCount: parseInt(params?.cinemasCount),
					showsPerCinemaPerDay: parseInt(
						params?.showsPerCinemaPerDay,
					),
					includeSeatClasses: params?.includeSeatClasses,
					seed: parseInt(params?.seed),
				},
				{},
			);
			setDatasetId(id);
			setTimings(timings);
			setCounts(counts);

			const langs: string[] = await NativeInventory.getLanguages(id);
			setLanguages(langs);
			// initial picks will cascade via effects below
			setSelectedLanguage(undefined);
			setSelectedFormat(undefined);
			setSelectedDate(undefined);
			setFormats([]);
			setDates([]);
			setTheatres([]);
		} catch (e) {
			console.warn('Native generateAndIndex failed', e);
		} finally {
			setIsLoading(false);
		}
	}, [datasetId]);

	useEffect(() => {
		boot();
		// cleanup dataset on unmount
		return () => {
			if (datasetId)
				NativeInventory.destroyDataset(datasetId).catch(() => {});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// --- Selection handlers (invalidate deeper levels)
	const handleSelectLanguage = useCallback((lang: string) => {
		setSelectedLanguage(lang);
		setSelectedFormat(undefined);
		setSelectedDate(undefined);
		setFormats([]);
		setDates([]);
		setTheatres([]);
		setExpandedKey(null);
	}, []);

	const handleSelectFormat = useCallback((fmt: string) => {
		setSelectedFormat(fmt);
		setSelectedDate(undefined);
		setDates([]);
		setTheatres([]);
		setExpandedKey(null);
	}, []);

	const handleSelectDate = useCallback((d: string) => {
		setSelectedDate(d);
		setTheatres([]);
		setExpandedKey(null);
	}, []);

	// --- Auto-select first valid language
	useEffect(() => {
		if (!selectedLanguage && languages.length) {
			setSelectedLanguage(languages[0]);
		}
	}, [languages, selectedLanguage]);

	// --- Fetch formats when language changes
	useEffect(() => {
		(async () => {
			if (!datasetId || !selectedLanguage) return;
			try {
				const fmts: string[] = await NativeInventory.getFormats(
					datasetId,
					selectedLanguage,
				);
				setFormats(fmts);
				if (!selectedFormat || !fmts.includes(selectedFormat)) {
					setSelectedFormat(fmts[0]);
				}
			} catch (e) {
				console.warn('getFormats failed', e);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [datasetId, selectedLanguage]);

	// --- Fetch dates when format changes
	useEffect(() => {
		(async () => {
			if (!datasetId || !selectedLanguage || !selectedFormat) return;
			try {
				const ds: string[] = await NativeInventory.getDates(
					datasetId,
					selectedLanguage,
					selectedFormat,
				);
				setDates(ds);
				if (!selectedDate || !ds.includes(selectedDate)) {
					setSelectedDate(ds[0]);
				}
			} catch (e) {
				console.warn('getDates failed', e);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [datasetId, selectedLanguage, selectedFormat]);

	// --- Fetch theatre slice when date changes
	useEffect(() => {
		(async () => {
			if (
				!datasetId ||
				!selectedLanguage ||
				!selectedFormat ||
				!selectedDate
			)
				return;
			try {
				const slice = await NativeInventory.getInventoryFor(
					datasetId,
					selectedLanguage,
					selectedFormat,
					selectedDate,
				);
				// slice.theatres is already UI-ready
				setTheatres(slice.theatres ?? []);
			} catch (e) {
				console.warn('getInventoryFor failed', e);
			}
		})();
	}, [datasetId, selectedLanguage, selectedFormat, selectedDate]);

	// --- UI bits
	const loadingUI = (
		<View style={styles.loadingWrap}>
			<ActivityIndicator />
			<Text style={styles.loadingText}>Loading inventory…</Text>
		</View>
	);

	const emptyUI = (
		<View style={styles.emptyWrap}>
			<Text style={styles.emptyTitle}>No shows found</Text>
			<Pressable onPress={boot} style={styles.retryBtn}>
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
							selected={!!selected}
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
			<StatusBar barStyle={'light-content'} />
			{/* Benchmark bar */}
			<View style={styles.hud}>
				<Text style={styles.hudText}>
					item count {counts?.items ?? 0} · gen {timings.generateMs}ms
					· index {timings.indexMs}ms · total {timings.totalMs}ms
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
					containerStyle={{ marginTop: 16 }}
				/>

				<DateRail
					title='Date'
					data={dates}
					selected={selectedDate}
					onSelect={handleSelectDate}
					containerStyle={{ marginTop: 16, marginBottom: 16 }}
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

	if (isLoading || !datasetId) return loadingUI;
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
	cardTitle: { color: 'white', fontSize: 16, fontWeight: '600' },
	timesWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 10,
		gap: 2,
		marginHorizontal: -4,
	},

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
