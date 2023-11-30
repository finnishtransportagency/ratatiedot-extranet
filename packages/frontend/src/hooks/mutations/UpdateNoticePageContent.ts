import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../..';
import { QueryKeys } from '../../constants/QueryKeys';

export const useUpdateNoticePageContents = (noticeId: string) => {
  return useMutation({
    mutationKey: ['notice-page-content-update'],
    mutationFn: (data: any) => {
      const payload = {
        content: data.value,
        ...data.noticeFields,
      };
      const options = {
        method: 'PUT',
        data: payload,
        headers: {
          'content-type': 'application/json',
        },
      };
      return axios(`/api/notice/${noticeId}`, options);
    },
    onMutate: async (slateValue: any) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [QueryKeys.UPDATE_NOTICE_PAGE_CONTENTS_QUERY_KEY] });

      // Snapshot the previous value
      const previousSlateValue = queryClient.getQueryData([QueryKeys.UPDATE_NOTICE_PAGE_CONTENTS_QUERY_KEY]);

      // Optimistically update to the new value
      if (previousSlateValue) {
        queryClient.setQueryData([QueryKeys.UPDATE_NOTICE_PAGE_CONTENTS_QUERY_KEY], {
          // ...previousSlateValue,
          ...slateValue,
        });
        return previousSlateValue;
      }
    },
    onSuccess: (res) => res,
    onError: (err: Error) => {
      console.log(err);
      return err;
    },
    // Always refetch after error or success:
    onSettled: () => queryClient.invalidateQueries({ queryKey: [QueryKeys.UPDATE_NOTICE_PAGE_CONTENTS_QUERY_KEY] }),
  });
};
