import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { SearchParameterName } from '../../components/Search/FilterSearchData';
import { QueryKeys } from '../../constants/QueryKeys';
import { ExtendedSearchParameterName, TSearchParameterBody } from '../../types/types.d';
import { getRouterName } from '../../utils/helpers';
import { Filter } from '../../components/Search/filterStore';

const getSearchBody = ({
  searchString,
  from,
  to,
  mimeTypes,
  category,
  page,
  sort,
  contentSearch,
  nameSearch,
  titleSearch,
  descriptionSearch,
}: Filter) => {
  let body: { searchParameters: TSearchParameterBody[]; page?: number; sort?: string } = {
    searchParameters: [],
    page: page,
    sort: sort,
  };
  if (searchString) {
    body.searchParameters.push({
      parameterName: ExtendedSearchParameterName.NAME,
      term: searchString,
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
  if (mimeTypes?.length) {
    body.searchParameters.push({
      parameterName: SearchParameterName.MIME,
      fileTypes: mimeTypes,
    });
  }
  if (category) {
    body.searchParameters.push({
      parameterName: SearchParameterName.CATEGORY,
      categoryName: getRouterName(category.name),
    });
  }
  return body;
};

export const usePostAlfrescoSearch = (props: Filter) => {
  console.log('SEARCH: ', props);

  return useQuery({
    enabled: Boolean(props.searchString),
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
