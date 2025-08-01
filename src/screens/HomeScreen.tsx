import { useNavigation } from '@react-navigation/native';
import { Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TNavigationProps } from '../navigation/NavigationRouter';

export const HomeScreen = () => {
	const navigation = useNavigation<TNavigationProps>();

	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: 'white',
				paddingHorizontal: 16,
			}}
		>
			<Pressable
				style={{
					backgroundColor: 'black',
					padding: 10,
					alignItems: 'center',
					borderRadius: 8,
				}}
				onPress={() => navigation?.navigate('RNParserScreen', {})}
			>
				<Text
					style={{
						color: 'white',
						fontSize: 16,
						fontWeight: '500',
					}}
				>
					React Native Parsing Logic Screen
				</Text>
			</Pressable>
		</SafeAreaView>
	);
};
