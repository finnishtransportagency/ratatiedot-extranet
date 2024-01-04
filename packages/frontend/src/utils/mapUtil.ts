import axios from 'axios';
import { FinlandMapFeature } from '../components/Map/types';

import { Colors } from '../constants/Colors';
import { areas } from './helpers';

export const loadGeoJson = async (geoJsonPath: string) => {
  try {
    const response = await axios.get(geoJsonPath);
    const contentType = response.headers['content-type'];
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const geoJsonData = response.data;
      return geoJsonData;
    } else {
      throw new Error('Invalid content type: ' + contentType);
    }
  } catch (error) {
    console.log('Error loading GeoJSON:', error);
    throw error;
  }
};

export const getPolylineColor = (maintenanceArea: number) => {
  switch (maintenanceArea) {
    case 1:
      return Colors.darkblue;
    case 2:
      return Colors.lightgreen;
    case 3:
      return Colors.pink;
    case 4:
      return Colors.purple;
    case 5:
      return Colors.midblue;
    case 6:
      return Colors.lightred;
    case 7:
      return Colors.darkblue;
    case 8:
      return Colors.lightgreen;
    case 9:
      return Colors.pink;
    case 10:
      return Colors.purple;
    case 11:
      return Colors.midblue;
    case 12:
      return Colors.lightred;
  }
};

export const getPolylineDashArray = (maintenanceArea: number) => {
  return maintenanceArea > 6 ? '5, 10' : null;
};

export const polygonStyle = (feature: FinlandMapFeature) => {
  return {
    color: getPolylineColor(feature.properties.kpalue),
    dashArray: getPolylineDashArray(feature.properties.kpalue),
  };
};

export const findAreaId = (categoryId: string, areaNumber: number) => {
  const areaList = areas().find((area: any) => area.area === areaNumber);
  const areaId = areaList?.collection.find((collection) => collection.parentAlfrescoId === categoryId)?.alfrescoId;
  return areaId;
};

export const getReadableAreaTitle = (area: string) => {
  switch (area) {
    case 'alue_01_uusimaa':
      return 'Alue 1 Uusimaa';
    case 'alue_02_lounaisrannikko':
      return 'Alue 2 Lounaisrannikko';
    case 'alue_03_riihimaki-seinajoki':
      return 'Alue 3 Riihimäki-Seinäjoki';
    case 'alue_04_rauma-pieksamaki':
      return 'Alue 4 Rauma-Pieksämäki';
    case 'alue_05_haapamaen_tahti':
      return 'Alue 5 Haapamäen tähti';
    case 'alue_06_savon_rata':
      return 'Alue 6 Savon rata';
    case 'alue_07_karjalan_rata':
      return 'Alue 7 Karjalan rata';
    case 'alue_08_ylasavo':
      return 'Alue 8 Yläsavo';
    case 'alue_09_pohjanmaan_rata':
      return 'Alue 9 Pohjanmaan rata';
    case 'alue_10_keski-suomi':
      return 'Alue 10 Keski-Suomi';
    case 'alue_11_kainuu-oulu':
      return 'Alue 11 Kainuu-Oulu';
    case 'alue_12_oulu-lappi':
      return 'Alue 12 Oulu-Lappi';
    default:
      return area;
  }
};
