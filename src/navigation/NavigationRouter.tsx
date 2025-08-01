import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TNavigationRouterProps } from './NavigationRouterProps';
import { HomeScreen } from '../screens/HomeScreen';

const AppNavigator = createNativeStackNavigator<TNavigationRouterProps>();

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
		</AppNavigator.Navigator>
	);
};
