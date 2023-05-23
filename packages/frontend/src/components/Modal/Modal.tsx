import { FunctionComponent, JSXElementConstructor, ReactElement } from 'react';

import Close from '@mui/icons-material/Close';
import { Box, IconButton, Modal as MuiModal } from '@mui/material';

import { ModalContentWrapper } from '../../styles/common';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { Colors } from '../../constants/Colors';
import { useTranslation } from 'react-i18next';
import { SnackbarAlert } from '../Notification/Snackbar';

interface ModalProps {
  title?: string;
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  open: boolean;
  error?: boolean;
  success?: boolean;
  errorMessage: string;
  successMessage: string;
  handleClose: () => void;
  onSnackbarClose?: () => void;
}

export const Modal: FunctionComponent<ModalProps> = ({
  title,
  children,
  open,
  error,
  errorMessage,
  successMessage,
  handleClose,
  onSnackbarClose,
  success,
}) => {
  const { t } = useTranslation(['common']);
  return (
    <>
      <MuiModal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModalContentWrapper>
          <div>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <HighlightedTitle>{title}</HighlightedTitle>
              <IconButton
                sx={{ color: Colors.extrablack, marginRight: '-10px' }}
                edge="end"
                aria-label={t('common:action.close_modal')}
                onClick={() => handleClose()}
              >
                <Close></Close>
              </IconButton>
            </Box>
            {children}
          </div>
        </ModalContentWrapper>
      </MuiModal>
      <SnackbarAlert
        open={error}
        onSnackbarClose={onSnackbarClose}
        color={Colors.darkred}
        text={errorMessage}
      ></SnackbarAlert>
      <SnackbarAlert
        open={success}
        onSnackbarClose={onSnackbarClose}
        color={Colors.black}
        text={successMessage}
      ></SnackbarAlert>
    </>
  );
};
