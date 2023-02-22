import { FunctionComponent, JSXElementConstructor, ReactElement, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Close from '@mui/icons-material/Close';
import { Alert, Box, IconButton, Modal } from '@mui/material';

import { ModalContentWrapper } from '../../styles/common';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { Colors } from '../../constants/Colors';
import { AxiosError } from 'axios';

interface ModalProps {
  title?: string;
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  open: boolean;
  error?: AxiosError | Error | undefined;
  handleClose: () => void;
}

export const FileModal: FunctionComponent<ModalProps> = ({ title, children, open, error, handleClose }) => {
  const { t } = useTranslation(['common']);

  return (
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
          {error ? (
            <Alert sx={{ margin: '16px 0' }} severity="error">
              <span>{t('common:file.file_not_uploaded')}</span>
              <br></br>
              {error.message}
            </Alert>
          ) : null}
          {children}
        </div>
      </ModalContentWrapper>
    </Modal>
  );
};
