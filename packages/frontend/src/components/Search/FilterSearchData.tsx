import { flatMapByKey, generateYearsBetween, splitYearsIntoChunks } from '../../utils/helpers';
import categoryData from '../../assets/data/aineistoluokka.json';

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
    items: [
      {
        type: ItemTypeEnum.CHECKBOX,
        name: 'PDF',
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: 'Excel',
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: 'Image',
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: 'PowerPoint',
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: 'Word',
      },
    ],
  },
  {
    name: 'Aika',
    items: splitYearsIntoChunks(generateYearsBetween(1980))
      .reverse()
      .map((range) => ({
        name: `${range[0]}-${range[range.length - 1]}`,
        type: ItemTypeEnum.CHECKBOX,
        items: range.map((year) => ({ type: ItemTypeEnum.CHECKBOX, name: String(year) })),
      })),
  },
  {
    name: 'Alue',
    items: [
      {
        type: ItemTypeEnum.CHECKBOX,
        name: 'Etelä',
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: 'Länsi',
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: 'Itä',
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: 'Pohjoinen',
      },
    ],
  },
  {
    name: 'Aineistoluokka',
    items: flatMapByKey(categoryData, 'items').map((item: string) => ({
      type: ItemTypeEnum.CHECKBOX,
      name: item,
    })),
  },
];
