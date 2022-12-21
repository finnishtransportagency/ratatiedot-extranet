import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const usePostAlfrescoSearch = (term: string | null) => {
  return useQuery({
    enabled: Boolean(term),
    queryKey: ['alfresco-search', term],
    queryFn: async () => {
      const body = {
        searchParameters: [
          {
            parameterName: 'name',
            fileName: term,
          },
        ],
      };
      const response = await axios.post('/api/alfresco/search', body);
      return response.data;
    },
    onSuccess: (res) => res,
    // temporary
    // TODO: throw error in toaster
    onError: (err: Error) => {
      console.log(err);
      return err;
    },
  });
};
