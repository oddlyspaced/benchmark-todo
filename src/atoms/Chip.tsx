import { Pressable, StyleSheet, Text } from 'react-native';

export const Chip = ({
	label,
	selected,
	onPress,
	disabled,
}: {
	label: string;
	selected?: boolean;
	onPress?: () => void;
	disabled?: boolean;
}) => (
	<Pressable
		onPress={onPress}
		disabled={disabled}
		style={[
			styles.chip,
			selected && styles.chipSelected,
			disabled && styles.chipDisabled,
		]}
	>
		<Text
			style={[
				styles.chipText,
				selected && styles.chipTextSelected,
				disabled && styles.chipTextDisabled,
			]}
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
		marginRight: 8,
		backgroundColor: '#121212',
	},
	chipSelected: { backgroundColor: '#1f6feb', borderColor: '#1f6feb' },
	chipDisabled: { opacity: 0.5 },
	chipText: { color: '#e0e0e0', fontSize: 13 },
	chipTextSelected: { color: 'white', fontWeight: '600' },
	chipTextDisabled: { color: '#8a8a8a' },
});
