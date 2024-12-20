import { SortDataType } from '../constants/Data';
import { Sort } from '../types/search';
import { FileSizeUnit, LocaleLang, LocaleUnit } from '../constants/Units';
import categoryData from '../assets/data/FinnishCategories.json';
import { MainCategoryData, SubCategoryData } from '../types/types';
import { capitalize } from 'lodash';
import { devAreas, prodAreas, prodCategories, devCategories } from './categories';

const { VITE_BUILD_ENVIRONMENT } = import.meta.env;

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

/**
 * Mapping sort {field: string, ascending: boolean} to corresponding string value
 * @param sortRequest
 * @returns string
 */
export const mapSortTypeToValue = (sortRequest: Sort | null) => {
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
  return (categoryData || []).map((item: CategoryDataParameter) => {
    const categoryName = Object.values(item.category)[0];
    const subCategoryNames = Object.values(item.subCategories);
    return { category: categoryName, subCategories: subCategoryNames };
  });
};

/**
 * Iterate through category data list and return all main categories
 * @returns
 */
export const getMainCategoryData = (): MainCategoryData => {
  return (categoryData || []).reduce((mainCategories: object, item: CategoryDataParameter) => {
    mainCategories = { ...mainCategories, ...item.category };
    return mainCategories;
  }, {}) as MainCategoryData;
};

/**
 * Iterate through category data list and return all sub-categories
 * @returns object
 */
export const getSubCategoryData = (): SubCategoryData => {
  return (categoryData || []).reduce((subCategories: object, item: CategoryDataParameter) => {
    subCategories = { ...subCategories, ...item.subCategories };
    return subCategories;
  }, {}) as SubCategoryData;
};

/**
 * Return router name based on page title's name
 * @param name
 * @returns
 */
export const getRouterName = (name: string = '') => {
  return name.replace(/\s/g, '-').replace(/[()]/g, '').toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o');
};

export const parseRouterName = (routerName: string = '') => {
  switch (routerName) {
    // hard-coded cases
    case 'liikennepaikkapaatokset':
      return 'Liikennepaikkapäätökset';
    case 'rinf-rekisteri-eradis-tunnus':
      return 'RINF-rekisteri (ERADIS-tunnus)';
    case 'vak-ratapihat':
      return 'VAK-ratapihat';
    case 'siltojen-kiskotus--ja-kunnossapito-ohjeet':
      return 'Siltojen kiskotus- ja kunnossapito-ohjeet';
    case 'turvalaitteiden-huolto-ohjeet':
      return 'Turvalaitteiden huolto-ohjeet';
    case 'turvalaitteiden-kayttoohjeet':
      return 'Turvalaitteiden käyttöohjeet';
    case 'sahkorata':
      return 'Sähkörata';
    case 'syottoasemalaitteiden-huolto--ja-kayttoohjeet':
      return 'Syöttöasemalaitteiden huolto- ja käyttöohjeet';
    case 'ratajohdon-laitteiden-huolto--ja-kayttoohjeet':
      return 'Ratajohdon laitteiden huolto- ja käyttöohjeet';
    case 'liikennointi':
      return 'Liikennöinti';
    case 'kayttoohjeet':
      return 'Käyttöohjeet';
    case 'kirjautuminen-ja-kayttooikeudet':
      return 'Kirjautuminen ja käyttöoikeudet';
    case 'sisallon-hallinta':
      return 'Sisällön hallinta';
    default:
      return capitalize(routerName.replace(/-/g, ' '));
  }
};

export const matchRouteWithCategory = (routeList: any, categoryPage: string) => {
  return Object.values(routeList).find((r: any) => r.indexOf(categoryPage) !== -1);
};

export const areas = () => {
  if (VITE_BUILD_ENVIRONMENT === 'prod') {
    return prodAreas;
  }
  return devAreas;
};

export const categories = () => {
  if (VITE_BUILD_ENVIRONMENT === 'prod') {
    return prodCategories;
  }
  return devCategories;
};

export const getAreaByAlfrescoId = (alfrescoId: string) => {
  return areas().find((areaObj) => areaObj.collection.find((collection) => collection.alfrescoId === alfrescoId));
};

export const findCategoryIdByKey = (key: number) => {
  const category = categories().find((category) => category.key === key);

  if (!category) {
    console.error(`Category with id ${key} not found`);
    return '';
  }

  return category.alfrescoId;
};
