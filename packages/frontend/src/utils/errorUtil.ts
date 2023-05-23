import { AxiosError } from 'axios';
import { Errors } from '../constants/Errors';
import { t } from 'i18next';

export const getErrorMessage = (error: any): string => {
  if (error.name === 'AxiosError') {
    const axiosError = error as AxiosError;
    if (axiosError.code === Errors.ERR_NETWORK) {
      return t('common:error.networkError');
    }
    if (axiosError.code === Errors.ERR_BAD_REQUEST) {
      return t('common:error.badRequest');
    }
    if (axiosError.code === Errors.ERR_BAD_RESPONSE) {
      return t('common:error.500');
    }
  }
  return error?.message || t('common:error.500');
};
