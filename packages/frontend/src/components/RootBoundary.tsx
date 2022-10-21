import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { AccessDenied } from '../pages/AccessDenied';
import { NotFound } from '../pages/NotFound';

// TODO add more cases here
export function RootBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFound />;
    }

    if (error.status === 401) {
      return <AccessDenied />;
    }

    if (error.status === 503) {
      return <div>Looks like our API is down</div>;
    }
  }

  return <div>Something went wrong</div>;
}
