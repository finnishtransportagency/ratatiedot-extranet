import { useContext, useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useBlocker } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppBarContext } from '../../contexts/AppBarContext';
import { EditorContext } from '../../contexts/EditorContext';
import { Modal } from '../Modal/Modal';

export const EditorNavigationGuard = () => {
  const { openToolbar } = useContext(AppBarContext);
  const { hasUnsavedChanges, valueReset } = useContext(EditorContext);
  const { t } = useTranslation(['common']);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      openToolbar && hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const frame = requestAnimationFrame(() => cancelButton.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
  }, [blocker.state]);

  const cancel = () => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  const proceed = () => {
    if (blocker.state === 'blocked') {
      valueReset();
      blocker.proceed();
    }
  };

  return (
    <Modal
      open={blocker.state === 'blocked'}
      role="alertdialog"
      title={t('common:edit.unsaved_changes_title')}
      handleClose={cancel}
      errorMessage=""
      successMessage=""
    >
      <>
        <Typography id="modal-modal-description">{t('common:edit.unsaved_changes_message')}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: 3 }}>
          <Button ref={cancelButton} onClick={cancel}>
            {t('common:action.cancel')}
          </Button>
          <Button variant="contained" onClick={proceed}>
            {t('common:edit.leave_without_saving')}
          </Button>
        </Box>
      </>
    </Modal>
  );
};
