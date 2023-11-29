import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMatch } from 'react-router-dom';

export const useGetNoticePageContent = (route: string) => {
  const match = useMatch('/ajankohtaista/:id');

  return useQuery({
    enabled: !!match,
    queryKey: [route],
    queryFn: async () => {
      const response = await axios.get(`/api/notice/${route}`);
      return response.data;
    },
    onSuccess: (res) => res,
    onError: (err: Error) => {
      console.log(err);
      return err;
    },
  });
};
