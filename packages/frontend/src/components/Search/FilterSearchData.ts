import { flatMapByKey, generateYearsBetween, splitYearsIntoChunks } from '../../utils/helpers';
import categoryData from '../../assets/data/aineistoluokka.json';
import { FileFormats, FinnishRegions } from '../../constants/Data';

export enum ESearchParameterName {
  MIME = 'mime',
  REGION = 'region',
  MATERIAL_CLASS = 'materialClass',
}

export interface IItem {
  name: string;
  type: ESearchParameterName;
  items: string[];
}

// TODO: should this be hardcoded?
// TODO: this is temporary, possible change in data format
export const FilterSearchData: IItem[] = [
  {
    name: 'Muoto',
    type: ESearchParameterName.MIME,
    items: FileFormats,
  },
  {
    name: 'Alue',
    type: ESearchParameterName.REGION,
    items: FinnishRegions,
  },
  {
    name: 'Aineistoluokka',
    type: ESearchParameterName.MATERIAL_CLASS,
    items: flatMapByKey(categoryData, 'items'),
  },
];
