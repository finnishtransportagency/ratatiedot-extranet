import axios, { AxiosResponse } from 'axios';

export const deleteNotice = async (noticeId: string) => {
  return (await axios(`/api/notice/${noticeId}`, {
    method: 'DELETE',
  })) as AxiosResponse;
};
