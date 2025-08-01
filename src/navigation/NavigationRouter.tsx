import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TNavigationRouterProps } from './NavigationRouterProps';
import { HomeScreen } from '../screens/HomeScreen';
import { StackNavigationProp } from '@react-navigation/stack';
import { RNParserScreen } from '../screens/RNParserScreen';

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
		</AppNavigator.Navigator>
	);
};
