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
	dateStart: '2025-01-01',
	dateEnd: '2025-01-7',
	cinemasCount: 6,
	showsPerCinemaPerDay: 5,
	includeSeatClasses: true,
	seed: 42,
} as const;

const MASSIVE = {
	languagesCount: 3,
	formatsPerLanguage: 3,
	dateStart: '2025-01-01',
	dateEnd: '2025-01-30', // 30 days inclusive
	cinemasCount: 6,
	showsPerCinemaPerDay: 5,
	includeSeatClasses: true, // increases payload size per row
	seed: 42,
};

export const useInventory = (): TUseInventoryData => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ['INVENTORY', DEFAULTS, MASSIVE],
		queryFn: async () => {
			const t0 = Date.now();
			const resp = generateBackendInventory({ ...MASSIVE });
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
