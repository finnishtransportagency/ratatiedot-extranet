import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckIcon from '@mui/icons-material/Check';
import styled from '@emotion/styled';
import { DrawerWrapperProps } from '../../NavBar/DesktopDrawer';
import { Paper } from '@mui/material';
import { Colors } from '../../../constants/Colors';
import { SlateElementProps } from '../../../utils/slateEditorUtil';
import { ElementType } from '../../../utils/types';

export const NotificationEditorCard = ({ attributes, children, element }: SlateElementProps) => {
  const KindIcon = () => {
    switch (element.type) {
      case ElementType.NOTIFICATION_INFO:
        return <InfoOutlinedIcon />;
      case ElementType.NOTIFICATION_WARNING:
        return <WarningAmberOutlinedIcon />;
      case ElementType.NOTIFICATION_ERROR:
        return <ErrorOutlineOutlinedIcon />;
      case ElementType.NOTIFICATION_CONFIRMATION:
        return <CheckIcon />;
      default:
        return <></>;
    }
  };

  const paperStyleByKind = () => {
    switch (element.type) {
      case ElementType.NOTIFICATION_INFO:
        return { backgroundColor: Colors.darkblue, color: Colors.white };
      case ElementType.NOTIFICATION_WARNING:
        return { backgroundColor: Colors.yellow, color: Colors.extrablack };
      case ElementType.NOTIFICATION_ERROR:
        return { backgroundColor: Colors.darkred, color: Colors.white };
      case ElementType.NOTIFICATION_CONFIRMATION:
        return { backgroundColor: Colors.darkgreen, color: Colors.white };
      default:
        return {};
    }
  };
  return (
    <NotificationEditorCardPaperWrapper sx={{ ...paperStyleByKind() }} {...attributes}>
      <KindIcon />
      {children}
    </NotificationEditorCardPaperWrapper>
  );
};

const NotificationEditorCardPaperWrapper = styled(Paper)<DrawerWrapperProps>(({ theme, opentoolbar }) => ({
  minHeight: 50,
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
}));
