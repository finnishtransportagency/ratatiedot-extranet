import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { QueryKeys } from '../../constants/QueryKeys';
import { getRouterName } from '../../utils/helpers';
import { Routes, STATIC_ROUTES } from '../../constants/Routes';
import { useMatch } from 'react-router-dom';

export const useGetCategoryPageContent = (pathname: string) => {
  const route = pathname.split('/').at(-1) || '';
  const categoryName = getRouterName(route);
  const match = useMatch('/ajankohtaista/*');

  return useQuery({
    enabled:
      Boolean(categoryName) &&
      !STATIC_ROUTES.includes(categoryName) &&
      categoryName !== Routes.SEARCH_RESULT.slice(1) &&
      match === null,
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
