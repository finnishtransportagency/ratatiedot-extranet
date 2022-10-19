import { createBrowserRouter, RouteObject } from 'react-router-dom';

import { Home } from './pages/Home';
import { Routes } from './constants/Routes';
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
];

export const router = createBrowserRouter(routes);
