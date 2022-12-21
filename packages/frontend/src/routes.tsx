import { createBrowserRouter, RouteObject, redirect } from 'react-router-dom';

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
  {
    path: Routes.LOGOUT,
    element: <div>LOGGING OUT...</div>,
    errorElement: <RootBoundary />, // Send user here whenever error is thrown
    loader: async () => {
      console.log('Logging out');
      document.cookie = 'Return=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // check if cookie exists then redirect to /
      if (document.cookie.indexOf('Return') === -1) {
        return redirect(Routes.LOGOUT_REDIRECT);
      }
    },
  },
];

export const router = createBrowserRouter(routes);
