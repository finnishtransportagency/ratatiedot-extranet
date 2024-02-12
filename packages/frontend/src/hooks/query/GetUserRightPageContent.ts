import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { QueryKeys } from '../../constants/QueryKeys';
import { getRouterName } from '../../utils/helpers';
import { STATIC_ROUTES } from '../../constants/Routes';
import { useMatch } from 'react-router-dom';

export const useGetUserRightPageContent = (categoryName: string) => {
  const matchNoticeRoute = useMatch('/ajankohtaista/:id/:date');

  const matchCategoryPageRoute = Boolean(categoryName) && !STATIC_ROUTES.includes(categoryName);
  const endpoint = matchNoticeRoute
    ? `/api/admin`
    : matchCategoryPageRoute
    ? `/api/database/user-right?category=${getRouterName(categoryName)}`
    : '';

  return useQuery({
    enabled: !!endpoint,
    queryKey: [QueryKeys.GET_USER_RIGHT_PAGE_CONTENT_QUERY_KEY, categoryName],
    queryFn: async () => {
      const response = await axios.get(endpoint);
      return response.data;
    },
    onSuccess: (res) => res,
    onError: (err: Error) => {
      console.log(err);
      return err;
    },
  });
};
