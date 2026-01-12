import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../../utils/query-client';
import { QueryKeys } from '../../constants/QueryKeys';
import { getRouterName } from '../../utils/helpers';

export const useUpdatePageContents = (categoryName: string) => {
  return useMutation({
    mutationKey: ['page-content-update'],
    mutationFn: (data: any) => {
      const formData = new FormData();
      formData.append('pagecontent', JSON.stringify(data.value));
      if (data.selectedImage) {
        formData.append('file', data.selectedImage);
      }

      return axios(`/api/database/page-contents/${getRouterName(categoryName)}`, {
        method: 'PUT',
        data: formData,
        headers: {
          'content-Type': 'multipart/form-data',
        },
      });
    },
    onMutate: async (slateValue: any) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [QueryKeys.UPDATE_PAGE_CONTENTS_QUERY_KEY] });

      // Snapshot the previous value
      const previousSlateValue = queryClient.getQueryData([QueryKeys.UPDATE_PAGE_CONTENTS_QUERY_KEY]);

      // Optimistically update to the new value
      if (previousSlateValue) {
        queryClient.setQueryData([QueryKeys.UPDATE_PAGE_CONTENTS_QUERY_KEY], {
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: [QueryKeys.UPDATE_PAGE_CONTENTS_QUERY_KEY] }),
  });
};
