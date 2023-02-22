import { FunctionComponent, JSXElementConstructor, ReactElement } from 'react';

import Close from '@mui/icons-material/Close';
import { Snackbar, Box, IconButton, Modal, Alert } from '@mui/material';

import { ModalContentWrapper } from '../../styles/common';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { Colors } from '../../constants/Colors';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  title?: string;
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  open: boolean;
  error?: boolean;
  success?: boolean;
  handleClose: () => void;
  onSnackbarClose?: () => void;
}

export const FileModal: FunctionComponent<ModalProps> = ({
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
                size="small"
                area-label="close-modal"
                onClick={() => handleClose()}
              >
                <Close></Close>
              </IconButton>
            </Box>
            {children}
          </div>
        </ModalContentWrapper>
      </Modal>
      <Snackbar open={error} onClose={onSnackbarClose}>
        <Alert sx={{ backgroundColor: Colors.darkred }} variant="filled" severity="error" onClose={onSnackbarClose}>
          {t('common:file.file_not_uploaded')}
        </Alert>
      </Snackbar>
      <Snackbar open={success} onClose={onSnackbarClose}>
        <Alert
          sx={{ backgroundColor: Colors.black }}
          variant="filled"
          severity="error"
          icon={false}
          onClose={onSnackbarClose}
        >
          {t('common:file.file_uploaded')}
        </Alert>
      </Snackbar>
    </>
  );
};
