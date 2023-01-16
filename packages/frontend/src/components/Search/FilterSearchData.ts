import { flatMapByKey } from '../../utils/helpers';
import categoryData from '../../assets/data/aineistoluokka.json';
import { FileFormats } from '../../constants/Data';

export enum SearchParameterName {
  MIME = 'mime',
  CATEGORY = 'category',
}

export interface IItem {
  name: string;
  type: SearchParameterName;
  items: string[];
}

export const FilterSearchData: IItem[] = [
  {
    name: 'Muoto',
    type: SearchParameterName.MIME,
    items: FileFormats,
  },
  {
    name: 'Aineistoluokka',
    type: SearchParameterName.CATEGORY,
    items: flatMapByKey(categoryData, 'items'),
  },
];
