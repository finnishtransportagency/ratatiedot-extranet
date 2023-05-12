import { Feature } from 'geojson';

export interface FinlandMapFeature extends Feature {
  properties: {
    id: number;
    kpalue: number;
    tilirataos: number;
  };
}
