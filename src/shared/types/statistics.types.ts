/** Espejo de DTOs de StatisticsController (backend). */

export interface SystemStatisticsDto {
    totalAircraft?: number;
    activeAircraft?: number;
    totalManufacturers?: number;
    activeManufacturers?: number;
    totalFamilies?: number;
    activeFamilies?: number;
    totalTypes?: number;
    totalProductionStates?: number;
    totalSizeCategories?: number;
    totalSearches?: number;
    totalComparisons?: number;
    totalViews?: number;
    averageAircraftPerManufacturer?: number;
    averageAircraftPerFamily?: number;
    lastUpdated?: string;
    dataValidFrom?: string;
    dataValidTo?: string;
}

export interface AircraftStatisticsDto {
    totalAircraft?: number;
    activeAircraft?: number;
    averagePassengers?: number;
    averageRange?: number;
    largestAircraft?: string;
    longestRangeAircraft?: string;
    newestYear?: number;
    oldestYear?: number;
}

export interface ManufacturerStatisticsDto {
    totalManufacturers?: number;
    activeManufacturers?: number;
    topManufacturer?: string;
    averageAircraftPerManufacturer?: number;
    countriesCount?: number;
}

export interface FamilyStatisticsDto {
    totalFamilies?: number;
    activeFamilies?: number;
    topFamily?: string;
    averageModelsPerFamily?: number;
    categoriesCount?: number;
}

export interface SearchStatisticsDto {
    totalSearches?: number;
    uniqueSearchTerms?: number;
    averageSearchesPerDay?: number;
    popularSearchTerms?: string[];
    noResultSearches?: number;
    noResultRate?: number;
    searchesByType?: Record<string, number>;
    mostSearchedTerm?: string;
    averageResultsPerSearch?: number;
}

export interface AircraftPopularityDto {
    aircraftId?: number;
    aircraftName?: string;
    manufacturerName?: string;
    searchCount?: number;
    viewCount?: number;
    comparisonCount?: number;
    popularityScore?: number;
    ranking?: number;
}

export interface ComparisonPopularityDto {
    aircraftIds?: number[];
    aircraftNames?: string[];
    comparisonCount?: number;
    popularityScore?: number;
    ranking?: number;
    rankingChange?: number;
    recentComparisons?: number;
}

export type DistributionMap = Record<string, number>;

export type UsageStatisticsMap = Record<string, number>;
