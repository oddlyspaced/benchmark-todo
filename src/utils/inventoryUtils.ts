import dayjs from 'dayjs';
import { IInventory } from '../types/types';
import { IPersonPrice, IPriceProfile } from '../types/inventoryTypes';

export type TInventoryVendorIdPriceMap = {
	[vendorId: number]: number;
};

export type TInventoryTourIdVendorIdMap = {
	[tourId: number]: TInventoryVendorIdPriceMap;
};

export type TInventoryTimeTourIdMap = {
	[time: string]: TInventoryTourIdVendorIdMap;
};

export type TInventoryDateTimeMap = {
	[date: string]: TInventoryTimeTourIdMap;
};

// DATE -> TIME -> TOUR ID -> VENDOR ID -> PRICE
export const parseInventory = (data: IInventory[]) => {
	const timeStart = dayjs();
	const sourceMap: TInventoryDateTimeMap = {};
	for (let item of data) {
		if (!sourceMap[item?.date]) {
			sourceMap[item?.date] = {};
		}
		if (!sourceMap[item?.date]?.[item?.time]) {
			sourceMap[item?.date][item?.time] = {};
		}
		if (!sourceMap[item?.date]?.[item?.time]?.[item?.tourId]) {
			sourceMap[item?.date][item?.time][item?.tourId] = {};
		}
		if (
			!sourceMap[item?.date]?.[item?.time]?.[item?.tourId]?.[
				item?.vendorId
			]
		) {
			sourceMap[item?.date][item?.time][item?.tourId][item?.vendorId] =
				item?.price;
		}
	}

	const timeEnd = dayjs();

	const timeTaken = timeEnd.diff(timeStart, 'milliseconds');
	console.log('TEST: ' + timeTaken + ' // ' + data?.length);
};

export const getDisplayablePriceForPerPersonPricing = (
	perPersonPaxDetails: IPersonPrice[],
) => {
	const adultDetails = perPersonPaxDetails.find((paxDetails) => {
		return paxDetails.type == 'ADULT';
	});
	if (adultDetails === null || adultDetails === undefined) {
		return perPersonPaxDetails[0].listingPrice;
	} else {
		return adultDetails.listingPrice;
	}
};

export const getPriceFromPriceProfile = (priceProfile: IPriceProfile) => {
	return getDisplayablePriceForPerPersonPricing(priceProfile?.persons);
};
