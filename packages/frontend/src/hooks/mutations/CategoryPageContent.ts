import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { queryClient } from '../..';
import { getRouterName } from '../../utils/helpers';

export const UPDATE_PAGE_CONTENTS_QUERY_KEY = 'page-content-update';

export const useUpdatePageContents = (categoryName: string) => {
  return useMutation({
    mutationKey: ['page-content-update'],
    mutationFn: (slateValue: any) =>
      axios.put(`http://localhost:3002/api/database/page-contents/${getRouterName(categoryName)}`, slateValue),
    onMutate: async (slateValue: any) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [UPDATE_PAGE_CONTENTS_QUERY_KEY] });

      // Snapshot the previous value
      const previousSlateValue = queryClient.getQueryData([UPDATE_PAGE_CONTENTS_QUERY_KEY]);

      // Optimistically update to the new value
      if (previousSlateValue) {
        queryClient.setQueryData([UPDATE_PAGE_CONTENTS_QUERY_KEY], {
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
    onSettled: () => queryClient.invalidateQueries({ queryKey: [UPDATE_PAGE_CONTENTS_QUERY_KEY] }),
  });
};
