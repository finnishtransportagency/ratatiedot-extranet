import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';

import './index.css';
import 'leaflet/dist/leaflet.css';
import { router } from './routes';
import { theme } from './styles/createTheme';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/query-client';
import './i18n';

// Re-export for backwards compatibility
export { queryClient };

const root = ReactDOM.createRoot(document.getElementById('root') || document.createElement('div')); // for testing purposes
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
