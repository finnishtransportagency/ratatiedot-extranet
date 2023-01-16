import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getRouterName } from '../../components/NavBar/MenuItems';
import { SearchParameterName } from '../../components/Search/FilterSearchData';
import { SortingParameters } from '../../contexts/SearchContext';
import { ExtendedSearchParameterName, TSearchParameterBody } from '../../types/types.d';

export type TAlfrescoSearchProps = {
  term: string | null;
  from?: string | number;
  to?: string | number;
  fileTypes?: string[];
  // TODO: multiple ainestoluokka/category
  categoryName: string;
  page?: number;
  sort?: SortingParameters;
};

const getSearchBody = ({ term, from, to, fileTypes, categoryName, page = 0, sort = [] }: TAlfrescoSearchProps) => {
  let body: { searchParameters: TSearchParameterBody[]; page?: number; sort?: SortingParameters } = {
    searchParameters: [],
    page: page,
    sort: sort,
  };
  if (term) {
    body.searchParameters.push({
      parameterName: ExtendedSearchParameterName.NAME,
      fileName: term,
    });
  }
  if (from) {
    body.searchParameters.push({
      parameterName: ExtendedSearchParameterName.MODIFIED,
      from: from,
      to: to,
    });
  }
  if (fileTypes?.length) {
    body.searchParameters.push({
      parameterName: SearchParameterName.MIME,
      fileTypes: fileTypes,
    });
  }
  if (categoryName) {
    body.searchParameters.push({
      parameterName: SearchParameterName.CATEGORY,
      categoryName: getRouterName(categoryName),
    });
  }
  return body;
};

export const usePostAlfrescoSearch = (props: TAlfrescoSearchProps) => {
  const { term } = props;

  return useQuery({
    enabled: Boolean(term),
    queryKey: ['alfresco-search', props],
    queryFn: async () => {
      const body = getSearchBody(props);
      const response = await axios.post('/api/alfresco/search', body);
      return response.data;
    },
    onSuccess: (res) => res,
    onError: (err: Error) => {
      console.log(err);
      return err;
    },
  });
};
