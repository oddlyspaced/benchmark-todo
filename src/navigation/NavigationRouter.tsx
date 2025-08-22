import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TNavigationRouterProps } from './NavigationRouterProps';
import { HomeScreen } from '../screens/HomeScreen';
import { StackNavigationProp } from '@react-navigation/stack';
import { RNParserScreen } from '../screens/RNParserScreen';
import { NativeParserScreen } from '../screens/NativeParserScreen';
import { Platform } from 'react-native';
import { isAndroid } from '../utils/platformUtils';

const AppNavigator = createNativeStackNavigator<TNavigationRouterProps>();
export type TNavigationProps = StackNavigationProp<TNavigationRouterProps, any>;

export const NavigationRouter = () => {
	return (
		<AppNavigator.Navigator
			initialRouteName={'HomeScreen'}
			screenOptions={{
				fullScreenGestureEnabled: true,
			}}
		>
			<AppNavigator.Screen
				name={'HomeScreen'}
				component={HomeScreen}
				options={{
					headerShown: false,
				}}
			/>
			<AppNavigator.Screen
				name={'RNParserScreen'}
				component={RNParserScreen}
				options={{
					headerShown: false,
				}}
			/>
			{isAndroid ? (
				<AppNavigator.Screen
					name={'NativeParserScreen'}
					component={NativeParserScreen}
					options={{
						headerShown: false,
					}}
				/>
			) : null}
		</AppNavigator.Navigator>
	);
};
