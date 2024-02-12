import { Alert, Typography } from '@mui/material';
import { ProtectedContainerWrapper } from '../../styles/common';
import { getErrorMessage } from '../../utils/errorUtil';

type TErrorMessageProps = {
  title?: string;
  error?: Error;
};

export const ErrorMessage = (props: TErrorMessageProps) => {
  const { title, error } = props;

  return (
    <ProtectedContainerWrapper>
      <Typography variant="subtitle1">{title}</Typography>
      <Alert severity="error">{getErrorMessage(error)}</Alert>
    </ProtectedContainerWrapper>
  );
};
