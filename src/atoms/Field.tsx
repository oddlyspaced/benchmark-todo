import { View, Text, TextInput } from 'react-native';

interface IFieldProps {
	label: string;
	value: string;
	onChangeText: (t: string) => void;
	keyboardType?: 'default' | 'number-pad' | 'numbers-and-punctuation';
	placeholder?: string;
}

/** Small labeled input component */
export const Field = ({
	label,
	value,
	onChangeText,
	keyboardType,
	placeholder,
}: IFieldProps) => {
	return (
		<View style={{ marginTop: 12 }}>
			<Text style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
				{label}
			</Text>
			<TextInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				keyboardType={keyboardType ?? 'default'}
				style={{
					height: 44,
					borderRadius: 8,
					paddingHorizontal: 12,
					borderWidth: 1,
					borderColor: '#e5e5e5',
					backgroundColor: '#fff',
					color: '#111',
				}}
				placeholderTextColor='#9ca3af'
			/>
		</View>
	);
};
