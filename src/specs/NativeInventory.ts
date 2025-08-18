import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type GenerateParams = {
	languagesCount: number;
	formatsPerLanguage: number;
	dateStart: string; // YYYY-MM-DD
	dateEnd: string; // YYYY-MM-DD
	cinemasCount: number;
	showsPerCinemaPerDay: number;
	includeSeatClasses?: boolean;
	seed?: number;
	basePriceINR?: number;
	priceJitterPct?: number;
	minSeatsPerShow?: number;
	maxSeatsPerShow?: number;
	showtimeWindow?: { start: string; end: string };
};

export type GenerateOptions = {
	datasetId?: string;
	ioMode?: 'memory' | 'file';
	emitProgress?: boolean;
};

export type Timings = {
	generateMs: number;
	reduceMs: number;
	indexMs: number;
	totalMs: number;
};

export type GenerateIndexResult = {
	datasetId: string;
	timings: Timings;
	counts: { items: number; days: number };
};

export type TheatreSlice = {
	languageCode: string;
	formatCode: string;
	date: string;
	theatres: Array<{
		cinemaId: string;
		cinemaName: string;
		shows: Array<{
			time: string;
			price: number;
			available: number;
			seatClasses?: Array<{
				code: string;
				name?: string;
				price: number;
				available: number;
			}>;
		}>;
	}>;
	meta?: { theatres: number; shows: number };
};

export interface Spec extends TurboModule {
	// Core
	generateAndIndex(
		params: GenerateParams,
		options?: GenerateOptions,
	): Promise<GenerateIndexResult>;

	// Getters
	getLanguages(datasetId: string): Promise<string[]>;
	getFormats(datasetId: string, languageCode: string): Promise<string[]>;
	getDates(
		datasetId: string,
		languageCode: string,
		formatCode: string,
	): Promise<string[]>;
	getInventoryFor(
		datasetId: string,
		languageCode: string,
		formatCode: string,
		date: string,
	): Promise<TheatreSlice>;

	// Lifecycle
	destroyDataset(datasetId: string): Promise<void>;

	// (optional) progress events exposed via TurboModule EventEmitter – add later if needed
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeInventory');
