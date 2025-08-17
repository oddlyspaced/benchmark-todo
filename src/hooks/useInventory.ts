// useInventory.ts
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { IInventoryResponse, TInventoryMap } from '../types/inventoryTypes';
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

const DEFAULTS = {
	languagesCount: 3,
	formatsPerLanguage: 3,
	dateStart: dayjs().format('YYYY-MM-DD'),
	dateEnd: dayjs().add(6, 'day').format('YYYY-MM-DD'),
	cinemasCount: 6,
	showsPerCinemaPerDay: 5,
	includeSeatClasses: true,
	seed: 42,
} as const;

export const useInventory = (): TUseInventoryData => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ['INVENTORY', DEFAULTS],
		queryFn: async () => {
			const t0 = Date.now();
			const resp = generateBackendInventory({ ...DEFAULTS });
			const t1 = Date.now();
			const map = buildInventoryMap(resp);
			const t2 = Date.now();

			const generateMs = t1 - t0;
			const reduceMs = t2 - t1;
			const totalMs = t2 - t0;

			return { resp, map, timings: { generateMs, reduceMs, totalMs } };
		},
	});

	return {
		response: data?.resp,
		map: data?.map,
		isLoading,
		refetch,
		timings: data?.timings ?? { generateMs: 0, reduceMs: 0, totalMs: 0 },
	};
};
