import axios, { AxiosResponse } from 'axios';

export const uploadNotice = async (notice: any): Promise<AxiosResponse> => {
  let response = null;

  const options = {
    method: 'POST',
    data: notice,
    headers: {
      'content-type': 'application/json',
    },
  };

  const url = `/api/notices`;
  response = await axios(url, options);

  return response as any;
};
