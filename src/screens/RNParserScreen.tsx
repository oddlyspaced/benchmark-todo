import { SafeAreaView } from 'react-native-safe-area-context';
import { useInventory } from '../hooks/useInventory';

export const RNParserScreen = () => {
	const { data, isFetching, isLoading } = useInventory();

	if (!data || isFetching || isLoading) {
		return <></>;
	}

	console.log(JSON.stringify(data));

	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: 'white',
			}}
		>
			{/* // todo */}
		</SafeAreaView>
	);
};
