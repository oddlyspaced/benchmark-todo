export interface IInventoryResponse {
	availabilities: IAvailability[];
	fromDate: string;
	toDate: string;
	currencyCode: string;
}

export interface IAvailability {
	startDate: string;
	startTime: string;
	tourId: number;
	vendorId: number;
	endTime: string;
	boosters: IBoosters | null;
	priceProfile: IPriceProfile;
	paxAvailability: IPaxAvailability[];
	paxValidation: Record<string, IPPaxValidationItem>;
}

export interface IBoosters {
	[key: string]: unknown;
}

export interface IPriceProfile {
	priceProfileType: string;
	persons: IPersonPrice[];
	groups: IGroup[];
	people: number;
}

export interface IPersonPrice {
	type: string;
	retailPrice: number;
	listingPrice: number;
	extraCharges: number;
	isPricingInclusiveOfExtraCharges: boolean;
	discount: number;
}

export interface IGroup {
	[key: string]: unknown;
}

export interface IPaxAvailability {
	remaining: number;
	availability: string;
	paxTypes: string[];
}

export interface IPPaxValidationItem {
	displayName: string;
	description: string;
	minPax: number;
	maxPax: number;
	ageFrom: number | null;
	ageTo: number | null;
}
