import { Alert, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProtectedContainerWrapper } from '../../styles/common';

type TErrorMessageProps = {
  title?: string;
  error?: Error;
};

export const ErrorMessage = (props: TErrorMessageProps) => {
  const { t } = useTranslation(['common']);
  const { title, error } = props;

  return (
    <ProtectedContainerWrapper>
      <Typography variant="subtitle1">{title}</Typography>
      <Alert severity="error">{error?.message || t('common:error.500')}</Alert>
    </ProtectedContainerWrapper>
  );
};
