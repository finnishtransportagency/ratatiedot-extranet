import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface SessionTimeoutWarningProps {
  warningTimeMinutes?: number; // Show warning X minutes before session expires
  sessionTimeoutMinutes?: number; // Total session timeout
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  warningTimeMinutes = 5,
  sessionTimeoutMinutes = 30,
}) => {
  const { t } = useTranslation(['common']);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // In a real implementation, you'd get the actual session expiration time
    // For now, this is a simplified version
    const warningTime = (sessionTimeoutMinutes - warningTimeMinutes) * 60 * 1000;

    const warningTimeout = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(warningTimeMinutes * 60);

      // Start countdown
      const countdown = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            // Auto-redirect when time runs out
            window.location.href = `${window.location.origin}/sso/logout?auth=1`;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }, warningTime);

    return () => clearTimeout(warningTimeout);
  }, [sessionTimeoutMinutes, warningTimeMinutes]);

  const handleExtendSession = () => {
    // Trigger a simple API call to extend the session
    fetch('/api/admin', { method: 'GET' })
      .then(() => {
        setShowWarning(false);
        setTimeRemaining(0);
      })
      .catch(() => {
        // If the call fails, the session is already expired
        window.location.href = `${window.location.origin}/sso/logout?auth=1`;
      });
  };

  const handleLogout = () => {
    document.cookie = 'Return=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = `${window.location.origin}/sso/logout?auth=1`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={showWarning}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" color="warning.main">
          Session Timeout Warning
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Your session will expire soon. Please extend your session or you will be logged out automatically.
        </Typography>
        <Typography variant="h6" color="error.main" align="center">
          {formatTime(timeRemaining)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout} variant="outlined">
          {t('common:action.close')}
        </Button>
        <Button onClick={handleExtendSession} variant="contained" color="primary">
          Extend Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};
