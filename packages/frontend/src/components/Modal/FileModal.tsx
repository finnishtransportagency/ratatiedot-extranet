import { FunctionComponent, JSXElementConstructor, ReactElement, useState } from 'react';
import { Box, IconButton, Modal } from '@mui/material';
import { ModalContentWrapper } from '../../styles/common';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import Close from '@mui/icons-material/Close';
import { Colors } from '../../constants/Colors';

interface ModalProps {
  title?: string;
  handleClose?: ((event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void) | undefined;
  children?: ReactElement<any, string | JSXElementConstructor<any>>;
  open: boolean;
}

export const FileModal: FunctionComponent<ModalProps> = (props) => {
  const [open, setOpen] = useState(true);
  const handleClose = () => setOpen(false);
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
          {props.children}
        </div>
      </ModalContentWrapper>
    </Modal>
  );
};
