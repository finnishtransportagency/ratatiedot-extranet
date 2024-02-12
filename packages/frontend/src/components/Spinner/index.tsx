import { CircularProgress } from '@mui/material';
import { ProtectedContainerWrapper } from '../../styles/common';

export const Spinner = () => {
  return (
    <ProtectedContainerWrapper>
      <CircularProgress />
    </ProtectedContainerWrapper>
  );
};
