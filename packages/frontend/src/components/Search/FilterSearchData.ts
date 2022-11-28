import { flatMapByKey, generateYearsBetween, splitYearsIntoChunks } from '../../utils/helpers';
import categoryData from '../../assets/data/aineistoluokka.json';
import { FileFormats, FinnishRegions } from '../../constants/Data';

export enum ItemTypeEnum {
  CHECKBOX = 'checkbox',
}

export interface IItem {
  name: string;
  type?: ItemTypeEnum;
  items?: IItem[];
}

// TODO: should this be hardcoded?
// TODO: this is temporary, possible change in data format
export const FilterSearchData: IItem[] = [
  {
    name: 'Muoto',
    items: FileFormats.map((formatType: string) => ({
      type: ItemTypeEnum.CHECKBOX,
      name: formatType,
    })),
  },
  {
    name: 'Aika',
    items: splitYearsIntoChunks(generateYearsBetween(1980))
      .reverse()
      .map((range) => {
        return {
          name: `${range[0]}-${range[range.length - 1]}`,
          type: ItemTypeEnum.CHECKBOX,
          items: range.map((year) => ({
            type: ItemTypeEnum.CHECKBOX,
            name: String(year),
          })),
        };
      }),
  },
  {
    name: 'Alue',
    items: FinnishRegions.map((region: string) => ({
      type: ItemTypeEnum.CHECKBOX,
      name: region,
    })),
  },
  {
    name: 'Aineistoluokka',
    items: flatMapByKey(categoryData, 'items').map((item: string) => ({
      type: ItemTypeEnum.CHECKBOX,
      name: item,
    })),
  },
];
