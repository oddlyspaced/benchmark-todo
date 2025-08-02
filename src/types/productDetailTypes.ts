export interface IProductDetails {
	id: number;
	name: string;
	flowType: string;
	neighbourhood: string;
	url: string;
	city: ICity;
	imageUploads: IImageUploads[];
	experienceVideo: IExperienceVideo;
	media: IMedia;
	displaySeatsLeftDisabled: boolean;
	displayTags: any[];
	allTags: string[];
	promotionLabel: string;
	metaTitle: string;
	metaDescription: string;
	summary: string;
	highlights: string;
	faq: string;
	validity: string;
	cancellation: any;
	adhoc: any;
	shortSummary: string;
	ticketDeliveryInfo: string;
	confirmedTicketInfo: string;
	inclusions: string;
	exclusions: string;
	additionalInfo: any;
	hasMobileTicket: boolean;
	hasHotelPickup: boolean;
	hasInstantConfirmation: boolean;
	hasSkipTheLine: boolean;
	hasFreeCancellation: boolean;
	flexiDate: boolean;
	startLocation: IStartLocation;
	endLocation: IEndLocation;
	minDuration: any;
	maxDuration: any;
	distance: any;
	tourType: string;
	descriptors: IDescriptors[];
	primaryCollection: IPrimaryCollection;
	collectionsFromRoot: ICollectionsFromRoot[];
	primaryCategory: IPrimaryCategory;
	primarySubCategory: IPrimarySubCategory;
	microBrandsDescriptor: string;
	microBrandsHighlight: string;
	microBrandSupportedLanguages: string[];
	microbrandInfo: IMicrobrandInfo;
	averageRating: number;
	reviewCount: number;
	topReviews: ITopReviews[];
	reviewsDetails: IReviewsDetails;
	listingPrice: IListingPrice;
	currency: ICurrency;
	listingPricesInAllCurrencies: any[];
	callToAction: string;
	canonicalUrl: any;
	noIndex: boolean;
	language: string;
	supportedLanguages: string[];
	contentMachineTranslated: boolean;
	variants: IVariant[];
}

export interface ICurrency {
	code: string;
	currencyName: string;
	symbol: string;
	localSymbol: string;
	precision: number;
	currency: string;
}

export interface ICountry {
	code: string;
	displayName: string;
	currency: ICurrency;
}

export interface ICity {
	code: string;
	displayName: string;
	country: ICountry;
	imageUrl: any;
	timeZone: string;
}

export interface IImageUploads {
	url: string;
	alt: string;
	keyword: string;
	title: string;
	credit: string;
}

export interface IExperienceVideo {
	url: string;
	alt: string;
	keyword: any;
	title: string;
	credit: string;
}

export interface IProductImages {
	url: string;
	altText: string;
	description: string;
	credit: string;
}

export interface IMedia {
	productImages: IProductImages[];
	safetyImages: any[];
	safetyVideos: any[];
}

export interface IStartLocation {
	latitude: number;
	longitude: number;
	addressLine1: string;
	addressLine2: string;
	cityName: string;
	postalCode: string;
	state: string;
	countryCode: string;
}

export interface IEndLocation {
	latitude: number;
	longitude: number;
	addressLine1: string;
	addressLine2: string;
	cityName: string;
	postalCode: string;
	state: string;
	countryCode: string;
}

export interface IDescriptors {
	code: string;
	name: string;
	displayName: string;
	iconUrl: string;
	description: string;
	type: string;
}

export interface IPrimaryCollection {
	id: number;
	name: string;
	displayName: string;
	tags: string[];
	svg: any;
	imageUrl: string;
}

export interface ICollectionsFromRoot {
	id: number;
	name: string;
	displayName: string;
	cityCode: string;
	urlSlug: string;
	heroImageUrl: string;
	cardImageUrl: string;
	title: string;
	heading: string;
	subtext: string;
	longFormDescription: any;
	metaDescription: string;
	primaryParentId: number;
	super: boolean;
	experienceCount: any;
	tags: string[];
	parentIds: number[];
	childrenIds: number[];
	canonicalUrl: any;
	noIndex: boolean;
	supportedLanguages: string[];
	language: string;
	urlSlugs: IUrlSlugs;
	startingPrice: any;
	parentCollections: any;
	active: boolean;
	ratingsInfo: any;
	collectionVideo: any;
	videos: any[];
	poiId: number;
	heroMedia: any;
	cardMedia: any;
	secondaryCities: any[];
	microBrandInfo: IMicroBrandInfo;
	useOldDesign: boolean;
	personaAffinityTags: any;
	distanceInKms: any;
	pageTitle: string;
	category: any;
	subcategory: any;
}

export interface IUrlSlugs {
	EN: string;
	ES: string;
	FR: string;
	IT: string;
	DE: string;
	PT: string;
	NL: string;
	PL: string;
	DA: string;
	NO: string;
	RO: string;
	RU: string;
	SV: string;
	TR: string;
}

export interface IMicroBrandInfo {
	descriptors: any;
	highlights: any;
	supportedLanguages: any[];
	metaTitle: any;
	metaDescription: string;
}

export interface IMicrobrandInfo {
	descriptors: string;
	highlights: string;
	supportedLanguages: string[];
	metaTitle: any;
	metaDescription: any;
}

export interface ITopReviews {
	tourId: number;
	bookingId: number;
	customerUserId: number;
	title: any;
	source: string;
	id: number;
	nonCustomerName: string;
	reviewerImgUrl: any;
	rating: number;
	content: string;
	reviewTime: number;
	reviewMedias: IReviewMedias[];
	translatedContent: string | null;
	useTranslatedContent: boolean;
	nonCustomerCountryCode: any;
	sourceLanguage: string;
	nonCustomerCountryName: any;
}

export interface IReviewMedias {
	url: string;
	fileType: string;
	fileSize: number;
	width: any;
	height: any;
	fileName: string;
}

export interface IReviewsDetails {
	reviewsCount: number;
	ratingsCount: number;
	averageRating: number;
	ratingsSplit: IRatingsSplit;
	showRatings: boolean;
	displayConfig: IDisplayConfig;
	reviewCountries: IReviewCountries;
}

export interface IRatingsSplit {
	1: number;
	2: number;
	3: number;
	4: number;
	5: number;
}

export interface IDisplayConfig {
	exposeRatings: boolean;
	exposeSorting: boolean;
	exposeFiltering: boolean;
	exposeLoadMore: boolean;
}

export interface IReviewCountries {
	countries: ICountries[];
	count: number;
}

export interface ICountries {
	code: string;
	displayName: string;
}

export interface IListingPrice {
	currencyCode: string;
	originalPrice: number;
	finalPrice: number;
	minimumPayablePrice: number;
	type: string;
	otherPricesExist: boolean;
	bestDiscount: number;
	cashbackValue: number;
	cashbackType: string;
	groupSize: any;
	extraCharges: number;
	isPricingInclusiveOfExtraCharges: boolean;
}

export interface IVariant {
	id: number;
	name: string;
	productId: number;
	ticketDeliveryInfo: any;
	confirmedTicketInfo: any;
	variantInfo: string;
	language: string;
	listingPrice: IListingPrice;
	tours: ITour[];
	boosterTags: any[];
	openDated: boolean;
}

export interface ITour {
	id: number;
	name: string;
	duration: number;
	inventoryType: string;
	minPax: number;
	maxPax: number;
	cashbackValue: number;
	cashbackType: string;
	userFields: IUserFields[];
	variantId: number;
	parentProductName: string;
	variantName: string;
	primaryVariantName: any;
	productId: number;
	ticketDeliveryInfo: any;
	confirmedTicketInfo: any;
	variantInfo: string;
	language: string;
	boosterTags: any[];
	additionalProperties: IAdditionalProperties[];
	additionalPropertiesV2: IAdditionalPropertiesV2[];
	vendorsMeetingLocation: IVendorsMeetingLocation;
}

export interface IUserFields {
	id: number;
	tourId: number;
	type: IType;
	level: string;
	required: boolean;
	isDeleted: any;
	lastModificationTimestamp: any;
	tourUserCustomField: ITourUserCustomField;
}

export interface IType {
	displayName: string;
	dataType: string | null; 
	regex: string | null;
	minLength: number | null;
	maxLength: number | null;
	minValue: any;
	maxValue: any;
	errorMessage: string | null;
	name: string;
}

export interface ITourUserCustomField {
	id: any;
	tourUserFieldId: any;
	name: any;
	type: any;
	creationTimeStamp: any;
	lastModificationTimestamp: any;
	tourUserCustomFieldEnumValues: any;
}

export interface IAdditionalProperties {
	type: string;
	value: string;
	localisedContent: ILocalisedContent;
	showAsGenericType: boolean;
}

export interface ILocalisedContent {
	type: string;
	description: any;
	value: string;
}

export interface IAdditionalPropertiesV2 {
	type: string;
	value: string;
	localisedContent: ILocalisedContent;
	showAsGenericType: boolean;
}

export interface IVendorsMeetingLocation {
	[key: string]: IVendorLocation;
}

export interface IVendorLocation {
	latitude: number;
	longitude: number;
}

export interface IPrimaryCategory {
	id: number;
	name: string;
	rank: number;
	displayName: string;
	heading: string;
	metaTitle: string;
	metaDescription: string;
	noIndex: boolean;
	canonicalUrl: any;
	urlSlugs: IUrlSlugs;
	medias: any[]; // array is empty in sample, keep loose-typed
	microBrandInfo: IMicroBrandInfo;
	ratingsInfo: any;
}

export interface IPrimarySubCategory {
	id: number;
	name: string;
	categoryId: number;
	rank: number;
	displayName: string;
	heading: string;
	metaTitle: string;
	metaDescription: string;
	noIndex: boolean;
	canonicalUrl: any;
	urlSlugs: IUrlSlugs;
	medias: any[];
	microBrandInfo: IMicroBrandInfo;
	ratingsInfo: any;
}
