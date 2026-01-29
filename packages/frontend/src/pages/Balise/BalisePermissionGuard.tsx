import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
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

  if (!permissions?.[requiredPermission]) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{errorMessage || DEFAULT_ERROR_MESSAGES[requiredPermission]}</Alert>
      </Box>
    );
  }

  return <>{children}</>;
};
