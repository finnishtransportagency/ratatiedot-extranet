import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { QueryKeys } from '../../constants/QueryKeys';
import { getRouterName } from '../../utils/helpers';
import { STATIC_ROUTES } from '../../constants/Routes';

export const useGetUserRightPageContent = (categoryName: string) => {
  return useQuery({
    enabled: Boolean(categoryName) && !STATIC_ROUTES.includes(categoryName),
    queryKey: [QueryKeys.GET_USER_RIGHT_PAGE_CONTENT_QUERY_KEY, categoryName],
    queryFn: async () => {
      const response = await axios.get(`/api/database/user-right?category=${getRouterName(categoryName)}`);
      return response.data;
    },
    onSuccess: (res) => res,
    onError: (err: Error) => {
      console.log(err);
      return err;
    },
  });
};
