import { Alert, AlertColor, Snackbar } from '@mui/material';
import { FunctionComponent } from 'react';

interface SnackBarProps {
  text: string;
  color: string;
  open: boolean | undefined;
  severity?: AlertColor;
  onSnackbarClose?: () => void | undefined;
}

export const SnackbarAlert: FunctionComponent<SnackBarProps> = ({
  color,
  onSnackbarClose,
  open,
  text,
  severity = 'error',
}) => {
  return (
    <Snackbar
      open={open}
      onClose={onSnackbarClose}
      autoHideDuration={6000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert sx={{ backgroundColor: color }} variant="filled" severity={severity} onClose={onSnackbarClose}>
        {text}
      </Alert>
    </Snackbar>
  );
};
