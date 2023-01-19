import { format } from 'date-fns';
import { SortDataType } from '../constants/Data';
import { FileSizeUnit, LocaleLang, LocaleUnit } from '../constants/Units';
import { Sorting } from '../contexts/SearchContext';

/**
 * Generate range of years
 * @param startYear
 * @param endYear
 * @returns array
 */
export const generateYearsBetween = (startYear: number, endYear: number = new Date().getFullYear()) => {
  let years = [];
  while (startYear <= endYear) {
    years.push(startYear);
    startYear++;
  }
  return years;
};

/**
 * Generate 2-dimensional array of years group by chunk size in ascending order
 * @param years
 * @param perChunk represent number of years per chunk/group
 * @returns array[][]
 */
export const splitYearsIntoChunks = (years: number[], perChunk: number = 10) => {
  if (!years.length || perChunk <= 0) return [];
  return years.reduce((acc: number[][], next: number, index: number) => {
    const chunkIndex = Math.floor(index / perChunk);
    if (!acc[chunkIndex]) {
      // start a new chunk
      acc[chunkIndex] = [];
    }
    acc[chunkIndex].push(next);
    return acc;
  }, []);
};

/**
 * Group object values by key and return new 1-dimensional array
 * @param array
 * @param key
 * @returns array
 */
export const flatMapByKey = (array: Array<any>, key: any): Array<any> => {
  return array.reduce((acc: Array<any>, next: Array<any>) => {
    if (!next[key]) return acc;
    return (acc = [...next[key], ...acc]);
  }, []);
};

export const getLocaleByteUnit = (unitStr: string, locale: LocaleLang) => {
  const unitParts = unitStr.split(' ');
  return unitParts[0] + ' ' + (LocaleUnit[locale][unitParts[1] as keyof FileSizeUnit] || unitParts[1]);
};

export const formatYear = (date: Date | null) => {
  return date ? format(date, 'yyyy') : '';
};

/**
 * Mapping sort {field: string, ascending: boolean} to corresponding string value
 * @param sortRequest
 * @returns string
 */
export const mapSortTypeToValue = (sortRequest: Sorting | null) => {
  if (!sortRequest) return SortDataType.NONE;
  const { field, ascending } = sortRequest;
  if (field === 'name' && ascending) return SortDataType.ASC_NAME;
  else if (field === 'name' && !ascending) return SortDataType.DESC_NAME;
  else if (field === 'modified' && ascending) return SortDataType.ASC_MODIFIED;
  else if (field === 'modified' && !ascending) return SortDataType.DESC_MODIFIED;
  else return SortDataType.NONE;
};

type CategoryDataParameter = { category: object; subCategories: object };
type TranslatedCategoryData = { category: string; subCategories: string[] };
/**
 * Iterate through category data list and extract category's and sub-category's values which are Finnish
 * @param categoryData
 * @returns Array
 */
export const getTranslatedCategoryData = (categoryData: CategoryDataParameter[]): TranslatedCategoryData[] => {
  return categoryData.map((item: CategoryDataParameter) => {
    const categoryName = Object.values(item.category)[0];
    const subCategoryNames = Object.values(item.subCategories);
    return { category: categoryName, subCategories: subCategoryNames };
  });
};

type SubCategoryData = {
  LINE_DIAGRAMS: string;
  SPEED_DIAGRAMS: string;
  TRACK_DIAGRAMS: string;
  GROUPING_DIAGRAMS: string;
  INTERCHANGE_DECISIONS: string;
  RAILWAY_SIGNS: string;
  RAILWAY_ASSET_NUMBERS: string;
  RAILWAY_MAPS: string;
  RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS: string;
  ROUTE_DOCUMENTS: string;
  RINF_REGISTER: string;
  VAK_RAIL_DEPOT: string;
  BRIDGE_INSPECTIONS: string;
  BRIDGE_MAINTENANCE_INSTRUCTIONS: string;
  TUNNELS: string;
  RAILWAY_TUNNEL_RESCUE_PLANS: string;
  SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS: string;
  SAFETY_EQUIPMENT_MANUALS: string;
  INTERCHANGE_CONTACT_INFORMATION: string;
  TRAFFIC_CONTROL_CONTACT_INFORMATION: string;
  MANAGEMENT_REPORTS: string;
  MONITORING_EQUIPMENT: string;
  REGIONAL_LIMITATIONS_DRIVER_ACTIVITY: string;
  PLANNING_ARCHIVE: string;
  RAILWAY_MONITORING_SERVICE: string;
};
/**
 * Iterate through category data list and return all sub-categories
 * @param categoryData
 * @returns object
 */
export const getSubCategoryData = (categoryData: CategoryDataParameter[]): SubCategoryData => {
  return categoryData.reduce((subCategories: object, item: CategoryDataParameter) => {
    subCategories = { ...subCategories, ...item.subCategories };
    return subCategories;
  }, {}) as SubCategoryData;
};

/**
 * Return router name based on page title's name
 * @param name
 * @returns
 */
export const getRouterName = (name: string) => {
  return name
    .replace(/\s/g, '-')
    .replace(/--/g, '-')
    .replace(/[()]/g, '')
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o');
};
