import axios from 'axios';

import { SearchParameterName } from '../../components/Search/FilterSearchData';
import { ExtendedSearchParameterName, TSearchParameterBody } from '../../types/types.d';
import { getRouterName } from '../../utils/helpers';
import { Filter, Sort } from '../../components/Search/filterStore';

const getSearchBody = ({
  searchString,
  from,
  to,
  mimeTypes,
  ancestor,
  page,
  sort,
  contentSearch,
  nameSearch,
  titleSearch,
  descriptionSearch,
}: Filter) => {
  let body: { searchParameters: TSearchParameterBody[]; page?: number; sort: Sort | null } = {
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
  if (to || from) {
    body.searchParameters.push({
      parameterName: ExtendedSearchParameterName.MODIFIED,
      from: from?.getFullYear().toString() as string,
      to: to?.getFullYear().toString() as string,
    });
  }
  if (mimeTypes?.length) {
    body.searchParameters.push({
      parameterName: SearchParameterName.MIME,
      fileTypes: mimeTypes,
    });
  }
  if (ancestor) {
    body.searchParameters.push({
      parameterName: SearchParameterName.ANCESTOR,
      ancestor: ancestor,
    });
  }
  return body;
};

export const searchFiles = async (filter: Filter) => {
  const response = await axios.post('/api/alfresco/search', getSearchBody(filter)).catch((err) => {
    return { data: null, error: err };
  });
  return { data: response.data, error: null };
};
