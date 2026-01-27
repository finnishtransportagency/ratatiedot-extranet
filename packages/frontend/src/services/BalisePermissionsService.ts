import axios from 'axios';

export interface BalisePermissions {
  canRead: boolean;
  canWrite: boolean;
  isAdmin: boolean;
}

export const getBalisePermissions = async (): Promise<BalisePermissions> => {
  const response = await axios.get('/api/balise/permissions');
  return response.data as BalisePermissions;
};
