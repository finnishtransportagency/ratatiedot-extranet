import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { QueryKeys } from '../../constants/QueryKeys';
import { getRouterName } from '../../utils/helpers';

export const useGetCategoryPageContent = (categoryName: string) => {
  return useQuery({
    enabled: Boolean(categoryName),
    queryKey: [QueryKeys.GET_PAGE_CONTENTS_QUERY_KEY, categoryName],
    queryFn: async () => {
      const response = await axios.get(`/api/database/page-contents/${getRouterName(categoryName)}`);
      return response.data;
    },
    onSuccess: (res) => res,
    onError: (err: Error) => {
      console.log(err);
      return err;
    },
  });
};
