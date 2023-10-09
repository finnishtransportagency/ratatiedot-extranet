import { flatMapByKey, getTranslatedCategoryData } from '../../utils/helpers';
import categoryData from '../../assets/data/FinnishCategories.json';
import { EMimeType, FileFormats } from '../../constants/Data';
import i18n from '../../i18n';

export enum SearchParameterName {
  MIME = 'mime',
  CATEGORY = 'category',
}

export interface Category {
  id: string;
  alfrescoId: string;
  name: string;
}

export interface Mime {
  id: number;
  type: EMimeType;
}

export interface IItem {
  name: string;
  type: SearchParameterName;
  items: string[];
}

// Omit instruction pages from filter search
const categoriesWithoutInstructions = categoryData.filter((entry) => {
  const categoryKey = Object.keys(entry.category)[0];
  return categoryKey !== 'INSTRUCTIONS';
});

export const FilterSearchData: IItem[] = [
  {
    name: i18n.t('search:format'),
    type: SearchParameterName.MIME,
    items: FileFormats,
  },
  {
    name: i18n.t('search:category'),
    type: SearchParameterName.CATEGORY,
    items: flatMapByKey(getTranslatedCategoryData(categoriesWithoutInstructions), 'subCategories'),
  },
];
