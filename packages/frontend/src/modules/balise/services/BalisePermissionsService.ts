import axios from 'axios';

export interface BalisePermissions {
  canRead: boolean;
  canWrite: boolean;
  canUnlockOthers: boolean;
  canDelete: boolean;
  canDeleteLocked: boolean;
  canViewHistory: boolean;
  canManageSections: boolean;
  currentUserUid: string;
}

export const getBalisePermissions = async (): Promise<BalisePermissions> => {
  const response = await axios.get('/api/balise/permissions');
  return response.data as BalisePermissions;
};
