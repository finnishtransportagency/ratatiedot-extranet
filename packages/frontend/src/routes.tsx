import { createBrowserRouter, RouteObject } from 'react-router-dom';

import { Home } from './pages/Home';
import { Landing } from './pages/Landing';
import { Routes } from './constants/Routes';
import { ProtectedPage } from './pages/ProtectedPage';
import { RootBoundary } from './components/RootBoundary';

const routes: RouteObject[] = [
  {
    path: Routes.HOME,
    element: <Home />,
    errorElement: <RootBoundary />, // Send user here whenever error is thrown
    loader: async () => {
      // TODO: throw error if user has no permission
    },
    children: [],
  },
  {
    path: Routes.LANDING,
    element: (
      <ProtectedPage>
        <Landing />
      </ProtectedPage>
    ),
    errorElement: <RootBoundary />, // Send user here whenever error is thrown
    loader: async () => {
      // TODO: throw error if user has no permission
    },
    children: [],
  },
];

export const router = createBrowserRouter(routes);
