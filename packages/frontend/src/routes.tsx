import { createBrowserRouter } from 'react-router-dom';

import { Home } from './pages/Home';
import { AccessDenied } from './pages/AccessDenied';
import { NotFound } from './pages/NotFound';
import { Landing } from './pages/Landing';
import { Routes } from './constants/Routes';
import { ProtectedPage } from './pages/ProtectedPage';

const routes = [
  {
    path: Routes.HOME,
    element: <Home />,
  },
  {
    path: Routes.ACCESS_DENIED,
    element: <AccessDenied />,
  },
  {
    path: Routes.LANDING, // Routes.HOME
    element: (
      <ProtectedPage>
        <Landing />
      </ProtectedPage>
    ),
  },
  // Only match when no route above is found
  {
    path: Routes.NOT_FOUND,
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);
