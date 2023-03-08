import { Box } from '@mui/material';

import InfoIcon from '../../assets/icons/Add_info.svg';
import WarningIcon from '../../assets/icons/Add_varoitus.svg';
import ErrorIcon from '../../assets/icons/Add_virhe.svg';
import ConfirmIcon from '../../assets/icons/Add_vahvistus.svg';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { AppBarContext } from '../../contexts/AppBarContext';
import { EditorContext } from '../../contexts/EditorContext';
import { ENotificationType } from '../../contexts/types';

export const NotificationTypes = () => {
  const { openToolbarHandler } = useContext(AppBarContext);
  const { kindHandler } = useContext(EditorContext);

  const handleOpenToolbar = (kind: ENotificationType) => {
    openToolbarHandler();
    kindHandler(kind);
  };

  return (
    <ContainerWrapper>
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={InfoIcon}
        alt="info"
        onClick={() => handleOpenToolbar(ENotificationType.INFO)}
      />
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={WarningIcon}
        alt="warning"
        onClick={() => handleOpenToolbar(ENotificationType.WARNING)}
      />
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={ErrorIcon}
        alt="error"
        onClick={() => handleOpenToolbar(ENotificationType.ERROR)}
      />
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={ConfirmIcon}
        alt="check"
        onClick={() => handleOpenToolbar(ENotificationType.CONFIRMATION)}
      />
    </ContainerWrapper>
  );
};

const ContainerWrapper = styled('div')(({ theme }) => ({
  textAlign: 'center',
  marginTop: '5px',
  [theme.breakpoints.only('desktop')]: {
    marginTop: '20px',
  },
}));
