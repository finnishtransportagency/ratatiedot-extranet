import React, { createContext, useContext, useEffect, useState } from 'react';
import { getBalisePermissions, BalisePermissions } from '../services/BalisePermissionsService';

interface BalisePermissionsContextValue {
  permissions: BalisePermissions | null;
  isLoading: boolean;
  error: Error | null;
}

const BalisePermissionsContext = createContext<BalisePermissionsContextValue | undefined>(undefined);

export const BalisePermissionsProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<BalisePermissions | null>(null);
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

  return (
    <BalisePermissionsContext.Provider value={{ permissions, isLoading, error }}>
      {children}
    </BalisePermissionsContext.Provider>
  );
};

export const useBalisePermissions = (): BalisePermissionsContextValue => {
  const context = useContext(BalisePermissionsContext);
  if (context === undefined) {
    console.error('useBalisePermissions must be used within a BalisePermissionsProvider');
    throw new Error('Järjestelmävirhe');
  }
  return context;
};
