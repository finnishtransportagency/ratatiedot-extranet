import { FC } from 'react';
import { AppBarContextProvider } from './AppBarContext';
import { MenuContextProvider } from './MenuContext';
import { CategoryDataContextProvider } from './CategoryDataContext';
import { ErrorContextProvider } from './ErrorContext';
import { BalisePermissionsProvider } from './BalisePermissionsContext';

const providers = [
  AppBarContextProvider,
  MenuContextProvider,
  CategoryDataContextProvider,
  ErrorContextProvider,
  BalisePermissionsProvider,
];

const combineComponents = (...components: FC[]) => {
  return components.reduce(
    (AccumulatedComponents: any, CurrentComponent: any) => {
      return ({ children }: any): JSX.Element => {
        return (
          <AccumulatedComponents>
            <CurrentComponent>{children}</CurrentComponent>
          </AccumulatedComponents>
        );
      };
    },
    ({ children }: any) => <>{children}</>,
  );
};

export const BaliseContextProvider = combineComponents(...providers);
