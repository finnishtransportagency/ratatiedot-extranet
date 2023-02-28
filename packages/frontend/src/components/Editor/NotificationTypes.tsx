import { Box } from '@mui/material';

import InfoIcon from '../../assets/icons/Add_info.svg';
import WarningIcon from '../../assets/icons/Add_varoitus.svg';
import ErrorIcon from '../../assets/icons/Add_virhe.svg';
import ConfirmIcon from '../../assets/icons/Add_vahvistus.svg';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { AppBarContext } from '../../contexts/AppBarContext';

export const NotificationTypes = () => {
  const { toggleToolbar } = useContext(AppBarContext);

  return (
    <ContainerWrapper>
      <Box component="img" sx={{ cursor: 'pointer' }} src={InfoIcon} alt="info" onClick={toggleToolbar} />
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={WarningIcon}
        alt="warning"
        onClick={() => console.log('Warning Icon')}
      />
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={ErrorIcon}
        alt="error"
        onClick={() => console.log('Error Icon')}
      />
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={ConfirmIcon}
        alt="check"
        onClick={() => console.log('Confirm Icon')}
      />
    </ContainerWrapper>
  );
};

const ContainerWrapper = styled('div')(() => ({
  textAlign: 'center',
  marginTop: '5px',
}));
