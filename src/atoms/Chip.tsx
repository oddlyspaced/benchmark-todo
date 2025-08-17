import { Pressable, StyleSheet, Text } from 'react-native';

interface IChipProps {
	label: string;
	selected?: boolean;
	onPress?: () => void;
}

export const Chip = ({ label, selected, onPress }: IChipProps) => (
	<Pressable
		onPress={onPress}
		style={[styles.chip, selected && styles.chipSelected]}
	>
		<Text
			style={[styles.chipText, selected && styles.chipTextSelected]}
			numberOfLines={1}
		>
			{label}
		</Text>
	</Pressable>
);

const styles = StyleSheet.create({
	chip: {
		paddingHorizontal: 14,
		height: 32,
		borderRadius: 16,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: '#2d2d2d',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#121212',
	},
	chipSelected: { backgroundColor: '#1f6feb', borderColor: '#1f6feb' },
	chipText: { color: 'white', fontSize: 13 },
	chipTextSelected: { color: 'white', fontWeight: '600' },
});
