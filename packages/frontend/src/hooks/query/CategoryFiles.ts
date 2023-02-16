import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type TCategoryProps = {
  routerName: string;
  page: number;
};

export const useGetCategoryFiles = (props: TCategoryProps) => {
  const { routerName, page = 0 } = props;

  return useQuery({
    enabled: Boolean(routerName),
    queryKey: ['alfresco-category-files', props],
    queryFn: async () => {
      const response = await axios.get(`/api/alfresco/files?category=${routerName}&page=${page}`);
      return response.data;
    },
    onSuccess: (res) => res,
    onError: (err: Error) => {
      console.log(err);
      return err;
    },
  });
};
