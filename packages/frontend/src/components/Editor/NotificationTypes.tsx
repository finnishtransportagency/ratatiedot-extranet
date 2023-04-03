import { Box } from '@mui/material';
import styled from '@emotion/styled';
import { useContext } from 'react';

import InfoIcon from '../../assets/icons/Add_info.svg';
import WarningIcon from '../../assets/icons/Add_varoitus.svg';
import ErrorIcon from '../../assets/icons/Add_virhe.svg';
import ConfirmIcon from '../../assets/icons/Add_vahvistus.svg';
import { EditorContext } from '../../contexts/EditorContext';
import { ElementType } from '../../utils/types';
import { openNotification } from '../../utils/slateEditorUtil';

export const NotificationTypes = () => {
  const { editor, value, valueHandler } = useContext(EditorContext);

  const handleOpenToolbar = (notificationType: ElementType) => {
    const newValue = [{ type: notificationType, ...value }];
    valueHandler(newValue);
    openNotification(editor, notificationType);
  };

  return (
    <ContainerWrapper>
      <Box
        aria-label="info"
        component="img"
        sx={{ cursor: 'pointer' }}
        src={InfoIcon}
        alt="info"
        onClick={() => handleOpenToolbar(ElementType.NOTIFICATION_INFO)}
      />
      <Box
        aria-label="warning"
        component="img"
        sx={{ cursor: 'pointer' }}
        src={WarningIcon}
        alt="warning"
        onClick={() => handleOpenToolbar(ElementType.NOTIFICATION_WARNING)}
      />
      <Box
        aria-label="error"
        component="img"
        sx={{ cursor: 'pointer' }}
        src={ErrorIcon}
        alt="error"
        onClick={() => handleOpenToolbar(ElementType.NOTIFICATION_ERROR)}
      />
      <Box
        aria-label="check"
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
