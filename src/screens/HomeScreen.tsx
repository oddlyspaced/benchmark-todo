import React, { useMemo, useState, useCallback } from 'react';
import {
	Alert,
	Pressable,
	ScrollView,
	StatusBar,
	Switch,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TNavigationProps } from '../navigation/NavigationRouter';
import { isAndroid } from '../utils/platformUtils';
import { Field } from '../atoms/Field';
import { TBenchmarkFormState } from '../types/inventoryTypes';

const DEFAULTS = {
	languagesCount: 3,
	formatsPerLanguage: 3,
	dateStart: '2025-01-01',
	dateEnd: '2025-01-07',
	cinemasCount: 6,
	showsPerCinemaPerDay: 5,
	includeSeatClasses: true,
	seed: 42,
} as const;

export const HomeScreen = () => {
	const navigation = useNavigation<TNavigationProps>();

	const [form, setForm] = useState<TBenchmarkFormState>({
		languagesCount: String(DEFAULTS.languagesCount),
		formatsPerLanguage: String(DEFAULTS.formatsPerLanguage),
		dateStart: DEFAULTS.dateStart,
		dateEnd: DEFAULTS.dateEnd,
		cinemasCount: String(DEFAULTS.cinemasCount),
		showsPerCinemaPerDay: String(DEFAULTS.showsPerCinemaPerDay),
		includeSeatClasses: DEFAULTS.includeSeatClasses,
		seed: String(DEFAULTS.seed),
	});

	const setField = useCallback(
		(k: keyof TBenchmarkFormState, v: string | boolean) =>
			setForm((s) => ({ ...s, [k]: v } as TBenchmarkFormState)),
		[],
	);

	const numeric = (v: string, fallback: number) => {
		const n = parseInt(v, 10);
		return Number.isFinite(n) ? n : fallback;
	};

	const payload = useMemo(() => {
		return {
			languagesCount: numeric(
				form.languagesCount,
				DEFAULTS.languagesCount,
			),
			formatsPerLanguage: numeric(
				form.formatsPerLanguage,
				DEFAULTS.formatsPerLanguage,
			),
			dateStart: form.dateStart.trim() || DEFAULTS.dateStart,
			dateEnd: form.dateEnd.trim() || DEFAULTS.dateEnd,
			cinemasCount: numeric(form.cinemasCount, DEFAULTS.cinemasCount),
			showsPerCinemaPerDay: numeric(
				form.showsPerCinemaPerDay,
				DEFAULTS.showsPerCinemaPerDay,
			),
			includeSeatClasses: form.includeSeatClasses,
			seed: numeric(form.seed, DEFAULTS.seed),
		};
	}, [form]);

	const validateDates = () => {
		// Very light validation: YYYY-MM-DD and start <= end
		const re = /^\d{4}-\d{2}-\d{2}$/;
		if (!re.test(payload.dateStart) || !re.test(payload.dateEnd)) {
			Alert.alert('Invalid date', 'Please use YYYY-MM-DD format.');
			return false;
		}
		if (payload.dateStart > payload.dateEnd) {
			Alert.alert(
				'Invalid range',
				'Start date must be before or equal to end date.',
			);
			return false;
		}
		return true;
	};

	const onReset = () =>
		setForm({
			languagesCount: String(DEFAULTS.languagesCount),
			formatsPerLanguage: String(DEFAULTS.formatsPerLanguage),
			dateStart: DEFAULTS.dateStart,
			dateEnd: DEFAULTS.dateEnd,
			cinemasCount: String(DEFAULTS.cinemasCount),
			showsPerCinemaPerDay: String(DEFAULTS.showsPerCinemaPerDay),
			includeSeatClasses: DEFAULTS.includeSeatClasses,
			seed: String(DEFAULTS.seed),
		});

	return (
		<>
			<StatusBar barStyle='dark-content' />
			<SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
				<ScrollView
					contentContainerStyle={{
						paddingHorizontal: 16,
						paddingBottom: 24,
					}}
					keyboardShouldPersistTaps='handled'
				>
					<Text
						style={{
							marginTop: 12,
							marginBottom: 8,
							fontSize: 18,
							fontWeight: '700',
						}}
					>
						Inventory Generator Params
					</Text>

					{/* Numeric fields */}
					<Field
						label='Languages Count (Max: 10)'
						value={form.languagesCount}
						onChangeText={(t) =>
							setField('languagesCount', t.replace(/[^0-9]/g, ''))
						}
						keyboardType='number-pad'
					/>
					<Field
						label='Formats per Language (Max: 5)'
						value={form.formatsPerLanguage}
						onChangeText={(t) =>
							setField(
								'formatsPerLanguage',
								t.replace(/[^0-9]/g, ''),
							)
						}
						keyboardType='number-pad'
					/>
					<Field
						label='Cinemas Count'
						value={form.cinemasCount}
						onChangeText={(t) =>
							setField('cinemasCount', t.replace(/[^0-9]/g, ''))
						}
						keyboardType='number-pad'
					/>
					<Field
						label='Shows per Cinema per Day'
						value={form.showsPerCinemaPerDay}
						onChangeText={(t) =>
							setField(
								'showsPerCinemaPerDay',
								t.replace(/[^0-9]/g, ''),
							)
						}
						keyboardType='number-pad'
					/>
					<Field
						label='Seed'
						value={form.seed}
						onChangeText={(t) =>
							setField('seed', t.replace(/[^0-9-]/g, ''))
						}
						keyboardType='numbers-and-punctuation'
					/>

					{/* String (dates) */}
					<Field
						label='Date Start (YYYY-MM-DD)'
						value={form.dateStart}
						onChangeText={(t) => setField('dateStart', t)}
						keyboardType='numbers-and-punctuation'
						placeholder='2025-01-01'
					/>
					<Field
						label='Date End (YYYY-MM-DD)'
						value={form.dateEnd}
						onChangeText={(t) => setField('dateEnd', t)}
						keyboardType='numbers-and-punctuation'
						placeholder='2025-01-07'
					/>

					{/* Boolean */}
					<View
						style={{
							marginTop: 12,
							paddingVertical: 6,
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}
					>
						<Text style={{ fontSize: 14, color: '#111' }}>
							Include Seat Classes
						</Text>
						<Switch
							thumbColor={'black'}
							trackColor={{
								true: '#999999',
							}}
							value={form.includeSeatClasses}
							onValueChange={(v) =>
								setField('includeSeatClasses', v)
							}
						/>
					</View>

					{/* Actions */}
					<Pressable
						onPress={onReset}
						style={{
							flex: 1,
							backgroundColor: '#EFEFEF',
							padding: 12,
							alignItems: 'center',
							borderRadius: 8,
						}}
					>
						<Text
							style={{
								color: '#111',
								fontSize: 16,
								fontWeight: '500',
							}}
						>
							Reset
						</Text>
					</Pressable>

					<Pressable
						style={{
							flex: 1,
							marginTop: 8,
							backgroundColor: 'black',
							padding: 12,
							alignItems: 'center',
							borderRadius: 8,
						}}
						onPress={() =>
							navigation?.navigate('RNParserScreen', {
								params: form,
							})
						}
					>
						<Text
							style={{
								color: 'white',
								fontSize: 16,
								fontWeight: '500',
							}}
						>
							React Native Parsing
						</Text>
					</Pressable>
					{isAndroid ? (
						<Pressable
							style={{
								marginTop: 8,
								backgroundColor: 'black',
								padding: 12,
								alignItems: 'center',
								borderRadius: 8,
							}}
							onPress={() =>
								navigation?.navigate('NativeParserScreen', {
									params: form,
								})
							}
						>
							<Text
								style={{
									color: 'white',
									fontSize: 16,
									fontWeight: '500',
								}}
							>
								Native Parsing
							</Text>
						</Pressable>
					) : null}
				</ScrollView>
			</SafeAreaView>
		</>
	);
};
