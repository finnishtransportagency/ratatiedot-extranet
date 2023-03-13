import { Box } from '@mui/material';
import styled from '@emotion/styled';
import { useContext } from 'react';

import InfoIcon from '../../assets/icons/Add_info.svg';
import WarningIcon from '../../assets/icons/Add_varoitus.svg';
import ErrorIcon from '../../assets/icons/Add_virhe.svg';
import ConfirmIcon from '../../assets/icons/Add_vahvistus.svg';
import { EditorContext } from '../../contexts/EditorContext';
import { ElementType } from '../../utils/types';
import { toggleNotification } from '../../utils/slateEditorUtil';

export const NotificationTypes = () => {
  const { editor, notificationTypeHandler } = useContext(EditorContext);

  const handleOpenToolbar = (notificationType: ElementType) => {
    toggleNotification(editor, notificationType);
    notificationTypeHandler(notificationType);
  };

  return (
    <ContainerWrapper>
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={InfoIcon}
        alt="info"
        onClick={() => handleOpenToolbar(ElementType.NOTIFICATION_INFO)}
      />
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={WarningIcon}
        alt="warning"
        onClick={() => handleOpenToolbar(ElementType.NOTIFICATION_WARNING)}
      />
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={ErrorIcon}
        alt="error"
        onClick={() => handleOpenToolbar(ElementType.NOTIFICATION_ERROR)}
      />
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={ConfirmIcon}
        alt="check"
        onClick={() => handleOpenToolbar(ElementType.NOTIFICATION_CONFIRMATION)}
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
