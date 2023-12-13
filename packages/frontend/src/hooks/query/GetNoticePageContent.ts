import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMatch } from 'react-router-dom';

export const useGetNoticePageContent = (noticeId: string) => {
  const match = useMatch('/ajankohtaista/:id/:date');

  return useQuery({
    enabled: !!match,
    queryKey: [noticeId],
    queryFn: async () => {
      const response = await axios.get(`/api/notice/${noticeId}`);
      return response.data;
    },
    onSuccess: (res) => res,
    onError: (err: Error) => {
      console.log(err);
      return err;
    },
  });
};
