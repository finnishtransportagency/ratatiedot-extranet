import { Category, Mime } from './FilterSearchData';
import { create } from 'zustand';
import { Sort } from '../../constants/Data';
import { searchFiles } from '../../hooks/query/Search';

export type Filter = {
  searchString: string;
  category: Category | null;
  mimeTypes: Mime[];
  from: Date | null;
  to: Date | null;
  page: number;
  sort: string;
  contentSearch: boolean;
  nameSearch: boolean;
  titleSearch: boolean;
  descriptionSearch: boolean;
};

export type FileStore = {
  data?: any | null;
  error?: any | null;
  fetch: () => void;
};

export type FilterAction = {
  updateSearchString: (searchString: Filter['searchString']) => void;
  updateCategory: (category: Filter['category']) => void;
  updateMimeTypes: (mimeTypes: Filter['mimeTypes']) => void;
  updateFrom: (from: Date | null) => void;
  updateTo: (to: Date | null) => void;
  updatePage: (page: Filter['page']) => void;
  updateSort: (sort: Filter['sort']) => void;
  updateContentSearch: (contentSearch: Filter['contentSearch']) => void;
  updateNameSearch: (nameSearch: Filter['nameSearch']) => void;
  updateTitleSearch: (titleSearch: Filter['titleSearch']) => void;
  updateDescriptionSearch: (descriptionSearch: Filter['descriptionSearch']) => void;
};

export const useFileStore = create<FileStore>((set) => ({
  data: null,
  error: null,
  fetch: async () => {
    const filter = getFilter();
    const response = await searchFiles(filter);
    set({ data: response.data, error: response.error });
  },
}));

export const useFiltersStore = create<Filter & FilterAction>((set) => ({
  searchString: '',
  category: null,
  mimeTypes: [],
  from: null,
  to: null,
  page: 0,
  sort: Sort.NONE,
  contentSearch: false,
  nameSearch: false,
  titleSearch: false,
  descriptionSearch: false,
  updateSearchString: (searchString) => set(() => ({ searchString: searchString })),
  updateCategory: (category) => set(() => ({ category })),
  updateMimeTypes: (mimeTypes) => set(() => ({ mimeTypes })),
  updateFrom: (from) => set(() => ({ from })),
  updateTo: (to) => set(() => ({ to })),
  updatePage: (page) => set(() => ({ page })),
  updateSort: (sort) => set(() => ({ sort })),
  updateContentSearch: (contentSearch) => set(() => ({ contentSearch })),
  updateNameSearch: (nameSearch) => set(() => ({ nameSearch })),
  updateTitleSearch: (titleSearch) => set(() => ({ titleSearch })),
  updateDescriptionSearch: (descriptionSearch) => set(() => ({ descriptionSearch })),
}));

export const getFilter = () => {
  const filter = {
    searchString: useFiltersStore.getState().searchString,
    category: useFiltersStore.getState().category,
    mimeTypes: useFiltersStore.getState().mimeTypes,
    from: useFiltersStore.getState().from,
    to: useFiltersStore.getState().to,
    page: useFiltersStore.getState().page,
    sort: useFiltersStore.getState().sort,
    contentSearch: useFiltersStore.getState().contentSearch,
    nameSearch: useFiltersStore.getState().nameSearch,
    titleSearch: useFiltersStore.getState().titleSearch,
    descriptionSearch: useFiltersStore.getState().descriptionSearch,
  };
  return filter;
};
