import axios, { AxiosResponse } from 'axios';

export const moveFile = async (
  categoryName: string,
  fileId: string,
  targetParentId: string,
): Promise<AxiosResponse> => {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    data: {
      targetParentId,
    },
  };

  console.log('options: ', options);
  const url = `/api/alfresco/files/${categoryName}/${fileId}/move`;
  const response = await axios(url, options);
  return response as any;
};
