import { format } from 'date-fns';
import { FileSizeUnit, LocaleLang, LocaleUnit } from '../constants/Units';

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
