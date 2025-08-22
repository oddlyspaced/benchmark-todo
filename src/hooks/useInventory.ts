import { useQuery } from '@tanstack/react-query';
import {
	IInventoryResponse,
	TBenchmarkFormState,
	TInventoryMap,
} from '../types/inventoryTypes';
import {
	generateBackendInventory,
	buildInventoryMap,
} from '../utils/inventoryUtils';

type TUseInventoryData = {
	response?: IInventoryResponse;
	map?: TInventoryMap;
	isLoading: boolean;
	refetch: () => void;
	timings: {
		generateMs: number;
		reduceMs: number;
		totalMs: number;
	};
};

export const generateAndParseRNInventory = (params: TBenchmarkFormState) => {
	const t0 = Date.now();
	const resp = generateBackendInventory({
		languagesCount: parseInt(params?.languagesCount),
		formatsPerLanguage: parseInt(params?.formatsPerLanguage),
		dateStart: params?.dateStart,
		dateEnd: params?.dateEnd,
		cinemasCount: parseInt(params?.cinemasCount),
		showsPerCinemaPerDay: parseInt(params?.showsPerCinemaPerDay),
		includeSeatClasses: params?.includeSeatClasses,
		seed: parseInt(params?.seed),
	});
	const t1 = Date.now();
	const map = buildInventoryMap(resp);
	const t2 = Date.now();

	const generateMs = t1 - t0;
	const reduceMs = t2 - t1;
	const totalMs = t2 - t0;

	return { resp, map, timings: { generateMs, reduceMs, totalMs } };
};

export const useInventory = (
	params: TBenchmarkFormState,
): TUseInventoryData => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ['INVENTORY', JSON.stringify(params)],
		queryFn: async () => generateAndParseRNInventory(params),
	});

	return {
		response: data?.resp,
		map: data?.map,
		isLoading,
		refetch,
		timings: data?.timings ?? { generateMs: 0, reduceMs: 0, totalMs: 0 },
	};
};
