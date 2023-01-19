import { LocaleLang } from '../../constants/Units';
import {
  generateYearsBetween,
  flatMapByKey,
  splitYearsIntoChunks,
  getLocaleByteUnit,
  getTranslatedCategoryData,
  getSubCategoryData,
} from '../helpers';

describe('Helpers Utility', () => {
  describe('generateYearsBetween()', () => {
    it('should generate correct years between 2010 and 2015', () => {
      expect(generateYearsBetween(2010, 2015)).toEqual([2010, 2011, 2012, 2013, 2014, 2015]);
    });
    it('should generate correct years between 2020 and 2022', () => {
      expect(generateYearsBetween(2020, 2022)).toEqual([2020, 2021, 2022]);
    });
    it('should return empty array if start year and end year are invalid', () => {
      expect(generateYearsBetween(2020, 2000)).toEqual([]);
    });
  });

  describe('splitYearsIntoChunks()', () => {
    it('should generate a 2-dimensional array of group of 3', () => {
      const years = generateYearsBetween(2018, 2022);
      expect(splitYearsIntoChunks(years, 3)).toEqual([
        [2018, 2019, 2020],
        [2021, 2022],
      ]);
    });
    it('should generate a 2-dimensional array of group of 2', () => {
      const years = generateYearsBetween(2018, 2022);
      expect(splitYearsIntoChunks(years, 2)).toEqual([[2018, 2019], [2020, 2021], [2022]]);
    });
    it('should generate a 2-dimensional array of group of 10', () => {
      const years = generateYearsBetween(1980, 2022);
      expect(splitYearsIntoChunks(years, 10)).toEqual([
        [1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989],
        [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
        [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009],
        [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
        [2020, 2021, 2022],
      ]);
    });
    it('should return empty array if `perChunk` is negative', () => {
      const years = generateYearsBetween(2018, 2022);
      expect(splitYearsIntoChunks(years, -1)).toEqual([]);
    });
  });

  describe('getTranslatedCategoryData()', () => {
    it('should return translated values for category and sub-categories', () => {
      expect(
        getTranslatedCategoryData([
          { category: { ANIMALS: 'Eläimet' }, subCategories: { DOG: 'Koira', CAT: 'Kissa' } },
          { category: { FLOWERS: 'Kukat' }, subCategories: { ROSE: 'Ruusu', DAISY: 'Päivänkakkara' } },
        ]),
      ).toEqual([
        { category: 'Eläimet', subCategories: ['Koira', 'Kissa'] },
        { category: 'Kukat', subCategories: ['Ruusu', 'Päivänkakkara'] },
      ]);
    });
  });

  describe('getSubCategoryData()', () => {
    it('should return sub-categories', () => {
      expect(
        getSubCategoryData([
          { category: { ANIMALS: 'Eläimet' }, subCategories: { DOG: 'Koira', CAT: 'Kissa' } },
          { category: { FLOWERS: 'Kukat' }, subCategories: { ROSE: 'Ruusu', DAISY: 'Päivänkakkara' } },
        ]),
      ).toEqual({ DOG: 'Koira', CAT: 'Kissa', ROSE: 'Ruusu', DAISY: 'Päivänkakkara' });
    });
  });

  describe('flatMapByKey()', () => {
    it('should group by key and flatten result by one level in ascending order', () => {
      expect(
        flatMapByKey(
          [
            { name: 'A', items: [10, 20] },
            { name: 'B', items: [1, 2, 3] },
            { name: 'C', differentItems: [-1, -2] },
          ],
          'items',
        ),
      ).toEqual([1, 2, 3, 10, 20]);
    });
    it('should return empty array if no key is found', () => {
      expect(
        flatMapByKey(
          [
            { name: 'A', items: [10, 20] },
            { name: 'B', items: [1, 2, 3] },
          ],
          'inexistent_key',
        ),
      ).toEqual([]);
    });
  });

  describe('getFinnishByteUnit()', () => {
    it('should return correct Finnish byte units', () => {
      expect(getLocaleByteUnit('3,5 B', LocaleLang.FI)).toBe('3,5 t');
      expect(getLocaleByteUnit('3,5 kB', LocaleLang.FI)).toBe('3,5 kt');
      expect(getLocaleByteUnit('3,5 MB', LocaleLang.FI)).toBe('3,5 Mt');
      expect(getLocaleByteUnit('3,5 GB', LocaleLang.FI)).toBe('3,5 Gt');
      expect(getLocaleByteUnit('3,5 TB', LocaleLang.FI)).toBe('3,5 Tt');
      expect(getLocaleByteUnit('3,5 PB', LocaleLang.FI)).toBe('3,5 Pt');
      expect(getLocaleByteUnit('3,5 xxB', LocaleLang.FI)).toBe('3,5 xxB');
    });
  });
});

// Or can set `"isolatedModules": false` in tsconfig.json
export {};
