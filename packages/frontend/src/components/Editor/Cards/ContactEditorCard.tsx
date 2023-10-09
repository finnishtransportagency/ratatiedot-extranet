import styled from '@emotion/styled';
import { DrawerWrapperProps } from '../../NavBar/DesktopDrawer';
import { Paper } from '@mui/material';
import { SlateElementProps } from '../../../utils/slateEditorUtil';
import { Colors } from '../../../constants/Colors';

export const ContactEditorCard = ({ attributes, children, element }: SlateElementProps) => {
  return <ContactEditorCardPaperWrapper {...attributes}>{children}</ContactEditorCardPaperWrapper>;
};

export const ContactEditorCardPaperWrapper = styled(Paper)<DrawerWrapperProps>(({ theme }) => ({
  backgroundColor: Colors.lightgrey,
  minHeight: '100px',
  padding: '20px',
  display: 'inline-block',
  verticalAlign: 'top',
  marginBottom: '20px',
  [theme.breakpoints.only('mobile')]: {
    width: '90%',
  },
  [theme.breakpoints.only('tablet')]: {
    width: '95%',
  },
  [theme.breakpoints.only('desktop')]: {
    marginLeft: '20px',
    width: '40%',
  },
}));
