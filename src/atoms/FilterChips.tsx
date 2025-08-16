import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Chip } from './Chip';

export const FilterChips = ({
	data,
	selected,
	onSelect,
	title,
}: {
	data: string[];
	selected?: string;
	onSelect: (v: string) => void;
	title: string;
}) => (
	<View style={styles.filterSection}>
		<Text style={styles.filterTitle}>{title}</Text>
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={styles.chipsRow}
		>
			{data.map((code) => (
				<Chip
					key={code}
					label={code.toUpperCase()}
					selected={selected === code}
					onPress={() => onSelect(code)}
				/>
			))}
		</ScrollView>
	</View>
);

const styles = StyleSheet.create({
	filterSection: { marginBottom: 8 },
	filterTitle: { color: '#bdbdbd', fontSize: 12, marginBottom: 6 },
	chipsRow: { gap: 8 },
});
