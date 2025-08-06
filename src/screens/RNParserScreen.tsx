import { SafeAreaView } from 'react-native-safe-area-context';
import { useInventory } from '../hooks/useInventory';
import { Text } from 'react-native';

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
			<Text>Variants: {Object.keys(data?.variantInfoMap)?.length}</Text>
			<Text>Tours: {Object.keys(data?.tourIdsInfoMap)?.length}</Text>
		</SafeAreaView>
	);
};
