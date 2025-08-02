import dayjs from 'dayjs';
import dayjsDuration from 'dayjs/plugin/duration';
import dayjsUtc from 'dayjs/plugin/utc';
import { IProductDetails, ITour, IVariant } from '../types/productDetailTypes';
import {
	IAvailability,
	IInventoryResponse,
	IPriceProfile,
} from '../types/inventoryTypes';

dayjs.extend(dayjsDuration);
dayjs.extend(dayjsUtc);

/**
 * Tour Group -> Variant -> Tour -> Date -> Time Slot
 */

export interface IProcessedTourGroupAvailability {
	variantAvailabilityMap: TVariantAvailabilityMap;
	tourIdsInfoMap: TTourInfoMap;
	variantInfoMap: TVariantInfoMap;
}

export type TVariantInfoMap = { [variantId: number]: IVariant };
export type TVariantAvailabilityMap = {
	[variantId: string]: IProcessedVariantAvailability;
};
export interface IProcessedVariantAvailability {
	variantId?: number;
	tourAvailabilityMap?: { [tourId: number]: IProcessedTourAvailability };
}

// TOUR LEVEL DEFINITIONS
export type TTourInfoMap = {
	[tourId: number]: TTourDetails;
};

export type TTourDetails = {
	tour: ITour;
	variantIds: number[];
};

export interface IProcessedTourAvailability {
	tourId: number;
	firstAvailableDate: dayjs.Dayjs;
	lastAvailableDate: dayjs.Dayjs;
	dates: TAvailabilityDateMap;
}

// DATE LEVEL DEFINITIONS
export type TAvailabilityDateMap = { [date: string]: IAvailabilityForDate };
interface IAvailabilityForDate {
	minPricedAvailability: IAvailability;
	timeSlotsMap: TAvailabilityTimeMap;
}

// TIME LEVEL DEFINITIONS
export type TAvailabilityTimeMap = {
	[time: string]: IAvailability[];
};

export const getPriceFromPriceProfile = (priceProfile: IPriceProfile) => {
	const perPersonPaxDetails = priceProfile?.persons;
	const adultDetails = perPersonPaxDetails.find((paxDetails) => {
		return paxDetails.type == 'ADULT';
	});
	if (adultDetails === null || adultDetails === undefined) {
		return perPersonPaxDetails[0].listingPrice;
	} else {
		return adultDetails.listingPrice;
	}
};

export const processInventory = (
	productDetails: IProductDetails,
	inventoryResponse: IInventoryResponse,
): IProcessedTourGroupAvailability => {
	const processingStartTime = dayjs();
	let variantAvailabilityMap: TVariantAvailabilityMap = {};
	let variantIdToVariantMap: TVariantInfoMap = {};
	let tourIdsInfoMap: TTourInfoMap = {}; //value will be string of variant IDs

	productDetails.variants.forEach((variant) => {
		variantIdToVariantMap[variant.id] = variant;
		variant.tours.forEach((tour) => {
			if (tourIdsInfoMap[tour.id]) {
				tourIdsInfoMap[tour.id].variantIds.push(variant.id);
			} else {
				tourIdsInfoMap[tour.id] = {
					tour,
					variantIds: [variant.id],
				};
			}
		});
	});

	inventoryResponse.availabilities.forEach((availability) => {
		const tourDetails = tourIdsInfoMap[availability.tourId];
		if (tourDetails.variantIds && tourDetails.variantIds.length > 0) {
			tourDetails.variantIds.forEach((variantId) => {
				if (variantAvailabilityMap?.[variantId]) {
					if (
						variantAvailabilityMap?.[variantId]
							?.tourAvailabilityMap?.[availability.tourId]
					) {
						if (
							variantAvailabilityMap?.[variantId]
								.tourAvailabilityMap[availability.tourId].dates[
								availability.startDate
							]
						) {
							const { minPricedAvailability, timeSlotsMap } =
								variantAvailabilityMap?.[variantId]
									.tourAvailabilityMap[availability.tourId]
									.dates[availability.startDate];

							const currentMinPriceProfile =
								getPriceFromPriceProfile(
									minPricedAvailability.priceProfile,
								);

							const currentAvPriceProfile =
								getPriceFromPriceProfile(
									availability.priceProfile,
								);

							const newMinPriceAvailability =
								currentMinPriceProfile < currentAvPriceProfile
									? minPricedAvailability
									: availability;

							const newTimeSlotsMap = {
								...timeSlotsMap,
								[availability.startTime]: [availability],
							};
							variantAvailabilityMap[
								variantId
							].tourAvailabilityMap[availability.tourId].dates[
								availability.startDate
							] = {
								minPricedAvailability: newMinPriceAvailability,
								timeSlotsMap: newTimeSlotsMap,
							};
						} else {
							// if variantID + tourId + date does not exist
							variantAvailabilityMap[
								variantId
							].tourAvailabilityMap[availability.tourId].dates[
								availability.startDate
							] = {
								minPricedAvailability: availability,
								timeSlotsMap: {
									[availability.startTime]: [availability],
								},
							};
						}

						const currentFirstAvailableDate =
							variantAvailabilityMap?.[variantId]
								.tourAvailabilityMap[availability.tourId]
								.firstAvailableDate;
						const currentLastAvailableDate =
							variantAvailabilityMap?.[variantId]
								.tourAvailabilityMap[availability.tourId]
								.lastAvailableDate;
						const availabilityDate = dayjs(availability.startDate);
						const newFirstAvailableDate =
							currentFirstAvailableDate.isBefore(availabilityDate)
								? currentFirstAvailableDate
								: availabilityDate;
						const newLastAvailableDate =
							currentLastAvailableDate.isAfter(availabilityDate)
								? currentLastAvailableDate
								: availabilityDate;
						variantAvailabilityMap[variantId].tourAvailabilityMap[
							availability.tourId
						].firstAvailableDate = newFirstAvailableDate;
						variantAvailabilityMap[variantId].tourAvailabilityMap[
							availability.tourId
						].lastAvailableDate = newLastAvailableDate;
					} else if (
						variantAvailabilityMap?.[variantId]?.tourAvailabilityMap
					) {
						variantAvailabilityMap[variantId].tourAvailabilityMap[
							availability.tourId
						] = {
							firstAvailableDate: dayjs(availability.startDate),
							lastAvailableDate: dayjs(availability.startDate),
							tourId: availability.tourId,
							dates: {
								[availability.startDate]: {
									minPricedAvailability: availability,
									timeSlotsMap: {
										[availability.startTime]: [
											availability,
										],
									},
								},
							},
						};
					}
				} else {
					// if entry for variant ID itself doesn't exist
					variantAvailabilityMap[variantId] = {
						variantId,
						tourAvailabilityMap: {
							[availability.tourId]: {
								firstAvailableDate: dayjs(
									availability.startDate,
								),
								lastAvailableDate: dayjs(
									availability.startDate,
								),
								tourId: availability.tourId,
								dates: {
									[availability.startDate]: {
										minPricedAvailability: availability,
										timeSlotsMap: {
											[availability.startTime]: [
												availability,
											],
										},
									},
								},
							},
						},
					};
				}
			});
		}
	});

	const processingEndTime = dayjs();
	console.log(
		'PROCESSING TIME: ' +
			processingEndTime.diff(processingStartTime, 'milliseconds'),
	);
	return {
		tourIdsInfoMap,
		variantInfoMap: variantIdToVariantMap,
		variantAvailabilityMap,
	};
};
