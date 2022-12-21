import { flatMapByKey } from '../../utils/helpers';
import categoryData from '../../assets/data/aineistoluokka.json';
import { FileFormats, FinnishRegions } from '../../constants/Data';

export enum SearchParameterName {
  MIME = 'mime',
  REGION = 'region',
  MATERIAL_CLASS = 'materialClass',
}

export interface IItem {
  name: string;
  type: SearchParameterName;
  items: string[];
}

// TODO: should this be hardcoded?
// TODO: this is temporary, possible change in data format
export const FilterSearchData: IItem[] = [
  {
    name: 'Muoto',
    type: SearchParameterName.MIME,
    items: FileFormats,
  },
  {
    name: 'Alue',
    type: SearchParameterName.REGION,
    items: FinnishRegions,
  },
  {
    name: 'Aineistoluokka',
    type: SearchParameterName.MATERIAL_CLASS,
    items: flatMapByKey(categoryData, 'items'),
  },
];
