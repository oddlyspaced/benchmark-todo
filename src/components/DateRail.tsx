import dayjs from 'dayjs';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Chip } from '../atoms/Chip';

interface IDateRail {
	days: string[];
	selected?: string;
	onSelect: (d: string) => void;
}

export const DateRail = ({ days, selected, onSelect }: IDateRail) => (
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

const styles = StyleSheet.create({
	filterSection: { marginBottom: 8 },
	filterTitle: { color: '#bdbdbd', fontSize: 12, marginBottom: 6 },
	chipsRow: { gap: 8 },
});
