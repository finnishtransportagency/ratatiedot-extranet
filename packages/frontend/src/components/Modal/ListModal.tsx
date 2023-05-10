import { FunctionComponent, JSXElementConstructor, ReactElement } from 'react';

import Close from '@mui/icons-material/Close';
import { Box, IconButton, Modal } from '@mui/material';

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
  handleClose: () => void;
  onSnackbarClose?: () => void;
}

export const ListModal: FunctionComponent<ModalProps> = ({
  title,
  children,
  open,
  error,
  handleClose,
  onSnackbarClose,
  success,
}) => {
  const { t } = useTranslation(['common']);
  return (
    <>
      <Modal
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
      </Modal>
      <SnackbarAlert
        open={error}
        onSnackbarClose={onSnackbarClose}
        color={Colors.darkred}
        text={t('common:file.files_not_deleted')}
      ></SnackbarAlert>
      <SnackbarAlert
        open={success}
        onSnackbarClose={onSnackbarClose}
        color={Colors.black}
        text={t('common:file.files_deleted')}
      ></SnackbarAlert>
    </>
  );
};

