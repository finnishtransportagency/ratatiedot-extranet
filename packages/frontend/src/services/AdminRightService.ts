import axios from 'axios';

export const checkAdminRights = async () => {
  const response = await axios.get('/api/admin');
  return response.data as any;
};
