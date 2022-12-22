import { createBrowserRouter, RouteObject, redirect } from 'react-router-dom';

import { Landing } from './pages/Landing';
import { Routes } from './constants/Routes';
import { ProtectedPage } from './pages/ProtectedPage';
import { RootBoundary } from './components/RootBoundary';
import { SearchResult } from './pages/Search/SearchResult';
import { LoggingOut } from './pages/LoggingOut';

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
  {
    path: Routes.LOGOUT_REDIRECT,
    loader: () => {
      document.cookie = 'Return=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // check if cookie is removed
      if (document.cookie.indexOf('Return') !== -1) {
        // TODO: What do we do if we ever get here? Now user might get stuck.
        throw new Error('Could not remove cookie.');
      }
      // redirect to logout url after succesfull cookie removal
      window.location.href = `${window.location.origin}/sso/logout?auth=1`;
    },
  },
];

export const router = createBrowserRouter(routes);
