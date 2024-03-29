import { AxiosError } from 'axios';
import { Errors } from '../constants/Errors';
import { t } from 'i18next';

export const getErrorMessage = (error: any): string => {
  if (error instanceof AxiosError) {
    const errorTranslationKey = error.response?.data?.errorTranslationKey;

    if (errorTranslationKey) {
      return t(`apiErrors:${errorTranslationKey}` as any);
    }

    switch (error.response?.status) {
      case 401:
        return t('common:error.401');
      case 403:
        return t('common:error.403');
      case 500:
        return t('common:error.500');
    }

    switch (error.code) {
      case Errors.ERR_BAD_REQUEST:
        return t('common:error.badRequest');
      case Errors.ERR_BAD_RESPONSE:
        return t('common:error.500');
      case Errors.ERR_NETWORK:
        return t('common:error.networkError');
    }
  }

  return error?.message || t('common:error.500');
};
