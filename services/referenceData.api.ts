/**
 * API client for the catch recording reference data service (vessels, etc.).
 *
 * @author Randhir Patel
 * @since 2026-11-25
 */
import { type APIResponse } from '@playwright/test';
import { BaseApi } from './baseApi';

const referenceDataPath = '/reference-data-service/api/v1/reference-data';

type ReferenceDataResponse<Dataset extends string, Item> = {
  dataset: Dataset;
  total: number;
  items: Item[];
};

export type ReferenceVessel = {
  id: string;
  name: string;
  namePln: string;
  status: string;
};

export type ReferenceVesselsResponse = ReferenceDataResponse<'vessels', ReferenceVessel>;

export type ReferencePort = {
  id: string;
  code: string;
  name: string;
  countryCode: string;
  coordinate: { latitude: number; longitude: number };
  active: boolean;
};

export type ReferencePortsResponse = ReferenceDataResponse<'ports', ReferencePort>;

export type ReferenceGearCharacteristic = {
  id: string;
  characteristicId: string;
  fixed: boolean;
  required: boolean;
  vesselLengthApplicability: string[];
};

export type ReferenceGear = {
  id: string;
  code: string;
  name: string;
  type: string;
  categoryId: string;
  pairFishing: boolean;
  applicableCharacteristics: ReferenceGearCharacteristic[];
  active: boolean;
};

export type ReferenceGearsResponse = ReferenceDataResponse<'gears', ReferenceGear>;

export type ReferenceSpeciesName = {
  id: string;
  countryCode: string;
  name: string;
};

export type ReferenceSpecies = {
  id: string;
  faoCode: string;
  scientificName: string;
  commonNames: ReferenceSpeciesName[];
  // Always empty in the current data, so the item shape is not known yet
  localNames: unknown[];
  active: boolean;
};

export type ReferenceSpeciesResponse = ReferenceDataResponse<'species', ReferenceSpecies>;

type ReferenceDatasets = {
  vessels: ReferenceVessel;
  ports: ReferencePort;
  gears: ReferenceGear;
  species: ReferenceSpecies;
};

export type ReferenceDatasetName = keyof ReferenceDatasets;

export class ReferenceDataApi extends BaseApi {
  getDataset(dataset: ReferenceDatasetName): Promise<APIResponse> {
    return this.get(`${referenceDataPath}/${dataset}`);
  }

  async getItems<Dataset extends ReferenceDatasetName>(dataset: Dataset): Promise<ReferenceDatasets[Dataset][]> {
    const response = await this.getDataset(dataset);

    if (!response.ok()) {
      throw new Error(`${dataset} request failed with status ${response.status()}`);
    }

    return ((await response.json()) as ReferenceDataResponse<Dataset, ReferenceDatasets[Dataset]>).items;
  }

  getVessels(): Promise<APIResponse> {
    return this.getDataset('vessels');
  }

  getPorts(): Promise<APIResponse> {
    return this.getDataset('ports');
  }

  getGears(): Promise<APIResponse> {
    return this.getDataset('gears');
  }

  getSpecies(): Promise<APIResponse> {
    return this.getDataset('species');
  }
}
