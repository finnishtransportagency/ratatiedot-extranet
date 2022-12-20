import { createBrowserRouter, RouteObject } from 'react-router-dom';

import { Landing } from './pages/Landing';
import { Routes } from './constants/Routes';
import { ProtectedPage } from './pages/ProtectedPage';
import { RootBoundary } from './components/RootBoundary';
import { SearchResult } from './pages/Search/SearchResult';

const routes: RouteObject[] = [
  {
    path: Routes.HOME,
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
  {
    path: Routes.SEARCH_RESULT,
    element: (
      <ProtectedPage>
        <SearchResult />
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
