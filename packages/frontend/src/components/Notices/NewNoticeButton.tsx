import { Button, ButtonProps } from '@mui/material';
import { AxiosResponse } from 'axios';
import { t } from 'i18next';
import { FunctionComponent } from 'react';

import { Image } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface DialogButtonProps {
  buttonProps?: ButtonProps;
  onUpload?: (response: AxiosResponse) => any;
}

export const NoticeDialogButton: FunctionComponent<DialogButtonProps> = ({ buttonProps }) => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        variant="text"
        startIcon={<Image />}
        {...buttonProps}
        onClick={() => navigate('/ajankohtaista/uusi')}
        sx={{ minHeight: 0, m: 0, p: 0, top: 0 }}
      >
        {t('common:action.add_new')}
      </Button>
    </>
  );
};
