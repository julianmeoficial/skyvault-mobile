export interface ManufacturerSummaryDto {
  id: number;
  name: string;
  country: string;
  logoUrl?: string;
}

export interface FamilyDto {
  id: number;
  name: string;
  description: string;
  launchDate: string;
  category: string;
  manufacturer: ManufacturerSummaryDto;
  activeModelCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyAircraftCardDto {
  id: number;
  name: string;
  type: string;
  category: string;
  productionState: string;
  passengers: number;
  range: number;
  fuelCapacity: number;
  year: number;
  imageUrl?: string;
}
