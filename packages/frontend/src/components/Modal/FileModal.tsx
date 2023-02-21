import { FunctionComponent, JSXElementConstructor, ReactElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Close from '@mui/icons-material/Close';
import { Alert, Box, IconButton, Modal } from '@mui/material';

import { ModalContentWrapper } from '../../styles/common';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { Colors } from '../../constants/Colors';
import { AxiosError } from 'axios';

interface ModalProps {
  title?: string;
  handleClose?: ((event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined;
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  open: boolean;
  error?: AxiosError | Error | undefined;
}

export const FileModal: FunctionComponent<ModalProps> = (props) => {
  const { t } = useTranslation(['common']);
  const [open, setOpen] = useState(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    console.log('Error: ', props.error);
  }, [props.error]);

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
            <HighlightedTitle>{props.title}</HighlightedTitle>
            <IconButton
              sx={{ color: Colors.extrablack, marginRight: '-10px' }}
              edge="end"
              size="small"
              area-label="close-modal"
              onClick={handleClose}
            >
              <Close></Close>
            </IconButton>
          </Box>
          {props.error ? (
            <Alert sx={{ margin: '16px 0' }} severity="error">
              <span>{t('common:file.file_not_uploaded')}</span>
              <br></br>
              {props.error.message}
            </Alert>
          ) : null}
          {props.children}
        </div>
      </ModalContentWrapper>
    </Modal>
  );
};
