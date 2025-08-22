export type TBenchmarkFormState = {
	languagesCount: string;
	formatsPerLanguage: string;
	dateStart: string;
	dateEnd: string;
	cinemasCount: string;
	showsPerCinemaPerDay: string;
	includeSeatClasses: boolean;
	seed: string;
};

export interface ISeatClass {
	code: string;
	name?: string;
	price: number;
	available: number;
}

export interface ICinemaMeta {
	name: string;
	city?: string;
	lat?: number;
	lng?: number;
}

export interface IShowInventoryItem {
	languageCode: string; // e.g. "en"
	formatCode: string; // e.g. "2d"
	date: string; // "YYYY-MM-DD"
	cinemaId: string; // stable id
	cinemaName?: string; // optional (can be looked up from dictionaries.cinemas)
	showId: string; // unique show id
	showTime: string; // "HH:mm"
	basePrice: number; // per-seat price
	availableSeats: number; // remaining seats
	capacity?: number;
	seatClasses?: ISeatClass[];
	auditorium?: string;
	screenType?: string;
	lastUpdatedIso?: string;
}

export interface IInventoryResponse {
	currency: string;
	items: IShowInventoryItem[];
	dictionaries?: {
		languages?: Record<string, string>;
		formats?: Record<string, string>;
		cinemas?: Record<string, ICinemaMeta>;
	};
	generatedAtIso?: string;
}

export type TInventoryMap = {
	[language: string]: {
		[format: string]: {
			[date: string]: {
				[cinemaId: string]: {
					cinemaName: string;
					shows: {
						[timeHHmm: string]: {
							price: number;
							availableSeats: number;
							seatClasses?: ISeatClass[];
						};
					};
				};
			};
		};
	};
};
