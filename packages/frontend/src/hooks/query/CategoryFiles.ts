import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type TCategoryProps = {
  routerName: string;
};

export const useGetCategoryFiles = (props: TCategoryProps) => {
  const { routerName } = props;

  return useQuery({
    enabled: Boolean(routerName),
    queryKey: ['alfresco-category-files', props],
    queryFn: async () => {
      const response = await axios.get(`/api/alfresco/files?category=${routerName}`);
      return response.data;
    },
    onSuccess: (res) => res,
    onError: (err: Error) => {
      console.log(err);
      return err;
    },
  });
};
