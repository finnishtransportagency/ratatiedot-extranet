import React, { createContext, useContext, useEffect, useState } from 'react';
import { getBalisePermissions, BalisePermissions } from '../services/BalisePermissionsService';
import { FormControl, FormControlLabel, Radio, RadioGroup, Paper, Typography } from '@mui/material';

interface BalisePermissionsContextValue {
  permissions: BalisePermissions | null;
  isLoading: boolean;
  error: Error | null;
}

const BalisePermissionsContext = createContext<BalisePermissionsContextValue | undefined>(undefined);

type PermissionMode = 'real' | 'read' | 'write' | 'admin';

export const BalisePermissionsProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<BalisePermissions | null>(null);
  const [permissionMode, setPermissionMode] = useState<PermissionMode>('real');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getBalisePermissions()
      .then((data) => {
        setPermissions(data);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setPermissions(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Calculate effective permissions based on mode
  const getEffectivePermissions = (): BalisePermissions | null => {
    if (permissionMode === 'real') return permissions;

    const testPermissions: Record<Exclude<PermissionMode, 'real'>, BalisePermissions> = {
      read: { canRead: true, canWrite: false, isAdmin: false },
      write: { canRead: true, canWrite: true, isAdmin: false },
      admin: { canRead: true, canWrite: true, isAdmin: true },
    };

    return testPermissions[permissionMode as Exclude<PermissionMode, 'real'>];
  };

  const effectivePermissions = getEffectivePermissions();

  return (
    <BalisePermissionsContext.Provider value={{ permissions: effectivePermissions, isLoading, error }}>
      {children}

      {/* Debug Permission Switcher */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          p: 2,
          zIndex: 9999,
          minWidth: 200,
          boxShadow: 3,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
          DEBUG: Permissions
        </Typography>
        <FormControl size="small">
          <RadioGroup value={permissionMode} onChange={(e) => setPermissionMode(e.target.value as PermissionMode)}>
            <FormControlLabel value="real" control={<Radio size="small" />} label="Real" />
            <FormControlLabel value="read" control={<Radio size="small" />} label="Read Only" />
            <FormControlLabel value="write" control={<Radio size="small" />} label="Write" />
            <FormControlLabel value="admin" control={<Radio size="small" />} label="Admin" />
          </RadioGroup>
        </FormControl>
      </Paper>
    </BalisePermissionsContext.Provider>
  );
};

export const useBalisePermissions = (): BalisePermissionsContextValue => {
  const context = useContext(BalisePermissionsContext);
  if (context === undefined) {
    throw new Error('useBalisePermissions must be used within a BalisePermissionsProvider');
  }
  return context;
};
