import React from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { useBalisePermissions } from '../../contexts/BalisePermissionsContext';

interface BalisePermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: 'canRead' | 'canWrite' | 'isAdmin';
  errorMessage?: string;
}

const DEFAULT_ERROR_MESSAGES = {
  canRead: 'Sinulla ei ole oikeuksia tarkastella tätä sivua.',
  canWrite: 'Sinulla ei ole oikeuksia ohjelmoida baliiseja.',
  isAdmin: 'Sinulla ei ole ylläpito-oikeuksia.',
  permissionError: 'Palveluun ei saada yhteyttä. Yritä myöhemmin uudelleen.',
};

export const BalisePermissionGuard: React.FC<BalisePermissionGuardProps> = ({
  children,
  requiredPermission,
  errorMessage,
}) => {
  const { permissions, isLoading: permissionsLoading } = useBalisePermissions();

  if (permissionsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // If permissions couldn't be loaded, show error
  if (permissions === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {DEFAULT_ERROR_MESSAGES.permissionError}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Yritä uudelleen
        </Button>
      </Box>
    );
  }

  // If permissions loaded successfully but user lacks required permission, deny access
  if (!permissions[requiredPermission]) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">{errorMessage || DEFAULT_ERROR_MESSAGES[requiredPermission]}</Alert>
      </Box>
    );
  }

  return <>{children}</>;
};
