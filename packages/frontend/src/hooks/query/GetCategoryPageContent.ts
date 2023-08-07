import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { QueryKeys } from '../../constants/QueryKeys';
import { getRouterName } from '../../utils/helpers';
import { Routes } from '../../constants/Routes';

export const useGetCategoryPageContent = (categoryName: string) => {
  return useQuery({
    enabled: Boolean(categoryName) && categoryName !== Routes.SEARCH_RESULT.slice(1),
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
