import { flatMapByKey, generateYearsBetween, splitYearsIntoChunks } from '../../utils/helpers';
import categoryData from '../../assets/data/aineistoluokka.json';
import { FileFormats, FinnishRegions } from '../../constants/Data';

export enum ItemTypeEnum {
  CHECKBOX = 'checkbox',
  DATE_PICKER = 'date_picker',
}

export interface IItem {
  name: string;
  type?: ItemTypeEnum;
  items?: IItem[] | any[];
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
  // {
  //   name: 'Aika',
  //   type: ItemTypeEnum.DATE_PICKER,
  //   items: generateYearsBetween(2002),
  // },
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
