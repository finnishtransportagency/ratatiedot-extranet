import { Category } from './FilterSearchData';
import { create } from 'zustand';
import { searchFiles } from '../../hooks/query/Search';
import { SortDataType } from '../../constants/Data';
import { produce } from 'immer';
import { Area } from '../../utils/categories';

export type Sort = {
  field: string | null;
  ascending: boolean | null;
};

export type Filter = {
  searchString: string;
  category: Category | null;
  area: Area | null;
  ancestor: string | null;
  mimeTypes: string[];
  from: Date | null;
  to: Date | null;
  page: number;
  sort: Sort | null;
  contentSearch: boolean;
  nameSearch: boolean;
  titleSearch: boolean;
  descriptionSearch: boolean;
};

export type FileStore = {
  isLoading: boolean;
  data?: any | null;
  error?: any | null;
  search: () => void;
};

export type FilterAction = {
  updateSearchString: (searchString: Filter['searchString']) => void;
  updateCategory: (category: Filter['category']) => void;
  updateArea: (area: Filter['area']) => void;
  toggleMimeType: (mimeType: string) => void;
  updateFrom: (from: Date | null) => void;
  updateTo: (to: Date | null) => void;
  resetTimespan: () => void;
  updatePage: (page: Filter['page']) => void;
  updateSort: (sort: Filter['sort']) => void;
  updateContentSearch: (contentSearch: Filter['contentSearch']) => void;
  updateNameSearch: (nameSearch: Filter['nameSearch']) => void;
  updateTitleSearch: (titleSearch: Filter['titleSearch']) => void;
  updateDescriptionSearch: (descriptionSearch: Filter['descriptionSearch']) => void;
  updateAncestor: (ancestor: Filter['ancestor']) => void;
  resetFilter: () => void;
};

export const useFileStore = create<FileStore>((set) => ({
  isLoading: false,
  data: null,
  error: null,
  search: async () => {
    set({ isLoading: true });
    const filter = getFilter();
    const { error, data } = await searchFiles(filter);
    set({ data: data, error: error });
    set({ isLoading: false });
  },
}));

const filterInitialState: Filter = {
  searchString: '',
  category: null,
  area: null,
  ancestor: null,
  mimeTypes: [],
  from: null,
  to: null,
  page: 0,
  sort: SortDataType.NONE,
  contentSearch: false,
  nameSearch: false,
  titleSearch: false,
  descriptionSearch: false,
};

export const useFiltersStore = create<Filter & FilterAction>((set) => ({
  ...filterInitialState,
  updateSearchString: (searchString) => set(() => ({ searchString: searchString })),
  updateAncestor: (ancestor) =>
    set(() => {
      return { ancestor: ancestor };
    }),
  updateCategory: (category) =>
    set((state) => {
      if (!state.area && category) {
        state.updateAncestor(category.alfrescoId);
      }
      return { category: category };
    }),
  updateArea: (area) =>
    set((state) => {
      const ancestorId = area?.collection.find((area) => {
        return area.parentAlfrescoId === state.category?.alfrescoId;
      })?.alfrescoId;
      if (ancestorId && state.category) {
        state.updateAncestor(ancestorId ?? state.category.alfrescoId);
      }
      return { area: area };
    }),
  toggleMimeType: (value) =>
    set(
      produce((state) => {
        if (state.mimeTypes.includes(value)) {
          state.mimeTypes = state.mimeTypes.filter((type: any) => type !== value);
        } else {
          state.mimeTypes.push(value);
        }
      }),
    ),
  updateFrom: (from) => set(() => ({ from })),
  updateTo: (to) => set(() => ({ to })),
  resetTimespan: () =>
    set(() => {
      return { from: null, to: null };
    }),
  updatePage: (page) =>
    set(() => {
      return { page: page };
    }),
  updateSort: (sort) => set(() => ({ sort })),
  updateContentSearch: (contentSearch) => set(() => ({ contentSearch })),
  updateNameSearch: (nameSearch) => set(() => ({ nameSearch })),
  updateTitleSearch: (titleSearch) => set(() => ({ titleSearch })),
  updateDescriptionSearch: (descriptionSearch) => set(() => ({ descriptionSearch })),
  resetFilter: () => set(filterInitialState),
}));

export const getFilter = () => {
  const filter = {
    searchString: useFiltersStore.getState().searchString,
    category: useFiltersStore.getState().category,
    ancestor: useFiltersStore.getState().ancestor,
    area: useFiltersStore.getState().area,
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
