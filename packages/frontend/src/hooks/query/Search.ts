import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { SearchParameterName } from '../../components/Search/FilterSearchData';
import { ExtendedSearchParameterName, TSearchParamaterBody } from '../../types/types.d';

export type TAlfrescoSearchProps = {
  term: string | null;
  from?: string | number;
  to?: string | number;
  fileTypes?: string[];
};

const getSearchBody = ({ term, from, to, fileTypes }: TAlfrescoSearchProps) => {
  let body: { searchParameters: TSearchParamaterBody[] } = { searchParameters: [] };
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
