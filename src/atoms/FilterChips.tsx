import {
	View,
	Text,
	StyleSheet,
	ViewStyle,
	StyleProp,
	FlatList,
} from 'react-native';
import { Chip } from './Chip';

export interface IFilterChipsProps {
	data: string[];
	selected?: string;
	onSelect: (v: string) => void;
	title: string;
	containerStyle?: StyleProp<ViewStyle>;
}

export const FilterChips = ({
	data,
	selected,
	onSelect,
	title,
	containerStyle,
}: IFilterChipsProps) => (
	<View style={containerStyle}>
		<Text style={styles.filterTitle}>{title}</Text>
		<FlatList
			horizontal
			showsHorizontalScrollIndicator={false}
			data={data}
			ItemSeparatorComponent={() => <View style={styles.separator} />}
			renderItem={({ item: code }) => {
				return (
					<Chip
						key={code}
						label={code.toUpperCase()}
						selected={selected === code}
						onPress={() => onSelect(code)}
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
