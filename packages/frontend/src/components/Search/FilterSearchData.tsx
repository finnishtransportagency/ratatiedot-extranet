import { flatMapByKey, generateYearsBetween } from '../../utils/helpers';
import categoryData from '../../assets/data/aineistoluokka.json';

export enum ItemTypeEnum {
  CHECKBOX = 'checkbox',
}

export interface IItem {
  name: string;
  type?: ItemTypeEnum;
  items?: IItem[];
}

export interface IFilterSearchData {
  name: string;
  type?: ItemTypeEnum;
  items: IItem[];
}

// TODO: should this be hardcoded?
// TODO: this is temporary, possible change in data format
export const FilterSearchData: IFilterSearchData[] = [
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
    items: [
      {
        type: ItemTypeEnum.CHECKBOX,
        name: '2020-2022',
        items: generateYearsBetween(2020).map((year) => ({
          type: ItemTypeEnum.CHECKBOX,
          name: String(year),
        })),
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: '2010-2019',
        items: generateYearsBetween(2010, 2019).map((year) => ({
          type: ItemTypeEnum.CHECKBOX,
          name: String(year),
        })),
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: '2000-2009',
        items: generateYearsBetween(2000, 2009).map((year) => ({
          type: ItemTypeEnum.CHECKBOX,
          name: String(year),
        })),
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: '1990-1999',
        items: generateYearsBetween(1990, 1999).map((year) => ({
          type: ItemTypeEnum.CHECKBOX,
          name: String(year),
        })),
      },
      {
        type: ItemTypeEnum.CHECKBOX,
        name: '1980-1989',
        items: generateYearsBetween(1980, 1989).map((year) => ({
          type: ItemTypeEnum.CHECKBOX,
          name: String(year),
        })),
      },
    ],
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
