import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import * as Sentry from '@sentry/react';

import './index.css';
import 'leaflet/dist/leaflet.css';
import reportWebVitals from './reportWebVitals';
import { router } from './routes';
import { theme } from './styles/createTheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n';

const { VITE_BUILD_ENVIRONMENT } = import.meta.env;

Sentry.init({
  dsn: 'https://9238c8ef9eaace18f488ad5e56888704@o1193385.ingest.us.sentry.io/4509672444526593',
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  environment: VITE_BUILD_ENVIRONMENT,
  replaysSessionSampleRate: VITE_BUILD_ENVIRONMENT === 'prod' ? 0.1 : 1,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: false,
      staleTime: 0,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') || document.createElement('div')); // for testing purposes
root.render(
  <Sentry.ErrorBoundary>
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  </Sentry.ErrorBoundary>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
