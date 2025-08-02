import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, Text } from 'react-native';
import bookingInventoryProcessor from '../utils/bookingInventoryProcessor';
import { DUMMY_PRODUCT_DETAILS } from '../data/dummyProductDetailsResponse';
import { DUMMY_INVENTORY_RESPONSE } from '../data/dummyInventoryResponse';

export const RNParserScreen = () => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: 'white',
			}}
		>
			<Pressable
				onPress={() => {
					bookingInventoryProcessor.processInventory(
						DUMMY_PRODUCT_DETAILS,
						DUMMY_INVENTORY_RESPONSE,
					);
				}}
			>
				<Text>Start Processing</Text>
			</Pressable>
		</SafeAreaView>
	);
};
