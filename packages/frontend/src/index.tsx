import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';

import './index.css';
import 'leaflet/dist/leaflet.css';
import reportWebVitals from './reportWebVitals';
import { router } from './routes';
import { theme } from './styles/createTheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: false,
      staleTime: 300000, // 5 minutes for data to be staled
    },
  },
});

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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
