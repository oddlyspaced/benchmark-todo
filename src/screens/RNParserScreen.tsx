import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseInventory } from '../utils/inventoryUtils';
import { INVENTORY, INVENTORY_36 } from '../data/dummyData';
import { Pressable, Text } from 'react-native';

export const RNParserScreen = () => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: 'white',
			}}
		>
			<Pressable onPress={() => {
				parseInventory(INVENTORY?.inventory)
			}}>
				<Text>Start Processing</Text>
			</Pressable>
		</SafeAreaView>
	);
};
