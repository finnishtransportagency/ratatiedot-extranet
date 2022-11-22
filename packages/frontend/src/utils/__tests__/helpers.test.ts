import { generateYearsBetween, flatMapByKey, splitYearsIntoChunks } from '../helpers';

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
    it('should return empty array if `perChunk` is negative', () => {
      const years = generateYearsBetween(2018, 2022);
      expect(splitYearsIntoChunks(years, -1)).toEqual([]);
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

// Or can set `"isolatedModules": false` in tsconfig.json
export {};
