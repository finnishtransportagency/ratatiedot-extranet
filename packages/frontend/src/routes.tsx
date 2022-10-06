import { createBrowserRouter } from 'react-router-dom';

import { Home } from './pages/Home';
import { AccessDenied } from './pages/AccessDenied';
import { NotFound } from './pages/NotFound';
import { Routes } from './constants/Routes';

const routes = [
  {
    path: Routes.HOME,
    element: <Home />,
  },
  {
    path: Routes.ACCESS_DENIED,
    element: <AccessDenied />,
  },
  // Only match when no route above is found
  {
    path: Routes.NOT_FOUND,
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);
