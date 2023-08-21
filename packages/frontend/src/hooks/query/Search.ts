import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { SearchParameterName } from '../../components/Search/FilterSearchData';
import { QueryKeys } from '../../constants/QueryKeys';
import { SortingParameters } from '../../contexts/SearchContext';
import { ExtendedSearchParameterName, TSearchParameterBody } from '../../types/types.d';
import { getRouterName } from '../../utils/helpers';

export type TAlfrescoSearchProps = {
  term: string | null;
  from?: string | number;
  to?: string | number;
  fileTypes?: string[];
  // TODO: multiple ainestoluokka/category
  categoryName: string;
  page?: number;
  sort?: SortingParameters;
  contentSearch?: boolean;
  nameSearch?: boolean;
  titleSearch?: boolean;
  descriptionSearch?: boolean;
};

const getSearchBody = ({
  term,
  from,
  to,
  fileTypes,
  categoryName,
  page = 0,
  sort = [],
  contentSearch,
  nameSearch,
  titleSearch,
  descriptionSearch,
}: TAlfrescoSearchProps) => {
  console.log('nameSEarch', nameSearch);
  let body: { searchParameters: TSearchParameterBody[]; page?: number; sort?: SortingParameters } = {
    searchParameters: [],
    page: page,
    sort: sort,
  };
  if (term) {
    body.searchParameters.push({
      parameterName: ExtendedSearchParameterName.NAME,
      term: term,
      contentSearch: contentSearch,
      nameSearch: nameSearch,
      titleSearch: titleSearch,
      descriptionSearch: descriptionSearch,
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
    queryKey: [QueryKeys.ALFRESCO_SEARCH, props],
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
