import dayjs from 'dayjs';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Chip } from '../atoms/Chip';
import { IFilterChipsProps } from '../atoms/FilterChips';

export const DateRail = ({
	data,
	selected,
	onSelect,
	containerStyle,
	title,
}: IFilterChipsProps) => (
	<View style={containerStyle}>
		<Text style={styles.filterTitle}>{title}</Text>
		<FlatList
			data={data}
			keyExtractor={(d) => d}
			horizontal
			showsHorizontalScrollIndicator={false}
			ItemSeparatorComponent={() => <View style={styles.separator} />}
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
	filterTitle: { color: 'white', fontSize: 12, marginBottom: 12 },
	separator: { width: 8 },
});
