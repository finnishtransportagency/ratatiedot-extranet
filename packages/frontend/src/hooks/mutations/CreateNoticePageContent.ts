import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../../utils/query-client';
import { QueryKeys } from '../../constants/QueryKeys';

export const useCreateNoticePageContent = () => {
  return useMutation({
    mutationKey: ['notice-page-content-create'],
    mutationFn: (data: any) => {
      const payload = {
        content: data.value,
        ...data.noticeFields,
      };

      const formData = new FormData();
      formData.append('notice', JSON.stringify(payload));
      if (data.selectedImage) {
        formData.append('file', data.selectedImage);
      }
      return axios(`/api/notices`, {
        method: 'POST',
        data: formData,
        headers: {
          'content-Type': 'multipart/form-data',
        },
      });
    },
    onMutate: async (slateValue: any) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [QueryKeys.CREATE_NOTICE_PAGE_CONTENTS_QUERY_KEY] });

      // Snapshot the previous value
      const previousSlateValue = queryClient.getQueryData([QueryKeys.CREATE_NOTICE_PAGE_CONTENTS_QUERY_KEY]);

      // Optimistically update to the new value
      if (previousSlateValue) {
        queryClient.setQueryData([QueryKeys.CREATE_NOTICE_PAGE_CONTENTS_QUERY_KEY], {
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: [QueryKeys.CREATE_NOTICE_PAGE_CONTENTS_QUERY_KEY] }),
  });
};
