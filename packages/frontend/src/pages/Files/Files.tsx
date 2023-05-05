import { Typography } from '@mui/material';

import { Tags } from '../../components/Tags';
import { ProtectedContainerWrapper } from '../../styles/common';

export const Files = () => {
  return (
    <ProtectedContainerWrapper>
      <Typography variant="subtitle1">Files page</Typography>
      <Tags />
    </ProtectedContainerWrapper>
  );
};
