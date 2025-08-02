import { useQuery } from '@tanstack/react-query';
import { DUMMY_PRODUCT_DETAILS } from '../data/dummyProductDetailsResponse';
import { DUMMY_INVENTORY_RESPONSE } from '../data/dummyInventoryResponse';
import { processInventory } from '../utils/inventoryUtils';

export const useInventory = () => {
	const { data, isFetching, isLoading } = useQuery({
		queryKey: ['INVENTORY'],
		queryFn: () =>
			processInventory(DUMMY_PRODUCT_DETAILS, DUMMY_INVENTORY_RESPONSE),
	});

	return {
		data,
		isFetching,
		isLoading,
	};
};
