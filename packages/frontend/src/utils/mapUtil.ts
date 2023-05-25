import axios from 'axios';
import { FinlandMapFeature } from '../components/Map/types';

import { Colors } from '../constants/Colors';

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

export const matchAreaIdWithFolderName = (maintenanceArea: number) => {
  let folderName = `alue_${maintenanceArea}_`;
  switch (maintenanceArea) {
    case 1:
      folderName += 'uusimaa';
      break;
    case 2:
      folderName += 'lounaisrannikko';
      break;
    case 3:
      folderName += 'riihimaki-seinajoki';
      break;
    case 4:
      folderName += 'rauma-pieksamaki';
      break;
    case 5:
      folderName += 'haapamaen_tahti';
      break;
    case 6:
      folderName += 'savon_rata';
      break;
    case 7:
      folderName += 'karjalan_rata';
      break;
    case 8:
      folderName += 'ylasavo';
      break;
    case 9:
      folderName += 'pohjanmaan_rata';
      break;
    case 10:
      folderName += 'keski-suomi';
      break;
    case 11:
      folderName += 'kainuu-oulu';
      break;
    case 12:
      folderName += 'oulu-lappi';
      break;
  }
  return folderName;
};
