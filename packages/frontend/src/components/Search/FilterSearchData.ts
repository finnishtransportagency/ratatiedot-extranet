import { flatMapByKey, getTranslatedCategoryData } from '../../utils/helpers';
import categoryData from '../../assets/data/FinnishCategories.json';
import { FileFormats } from '../../constants/Data';
import i18n from '../../i18n';

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
    name: i18n.t('search:format'),
    type: SearchParameterName.MIME,
    items: FileFormats,
  },
  {
    name: i18n.t('search:material_class'),
    type: SearchParameterName.CATEGORY,
    items: flatMapByKey(getTranslatedCategoryData(categoryData), 'subCategories'),
  },
];
