import React, { useState, useContext } from 'react';

interface ErrorContextProps {
  error: Error | null;
  setError: (error: Error | null) => void;
}

const ErrorContext = React.createContext<ErrorContextProps | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within a ErrorProvider');
  }
  return context;
};

export const ErrorContextProvider = (props: any) => {
  const [error, setError] = useState<Error | null>(null);

  return <ErrorContext.Provider value={{ error, setError }}>{props.children}</ErrorContext.Provider>;
};
