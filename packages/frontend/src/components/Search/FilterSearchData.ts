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
