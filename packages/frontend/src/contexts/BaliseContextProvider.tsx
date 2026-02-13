import { FC, ReactNode } from 'react';
import { AppBarContextProvider } from './AppBarContext';
import { MenuContextProvider } from './MenuContext';
import { CategoryDataContextProvider } from './CategoryDataContext';
import { ErrorContextProvider } from './ErrorContext';
import { BalisePermissionsProvider } from './BalisePermissionsContext';

const providers = [
  AppBarContextProvider,
  BalisePermissionsProvider,
  MenuContextProvider,
  CategoryDataContextProvider,
  ErrorContextProvider,
];

const combineComponents = (...components: FC<{ children?: ReactNode }>[]) => {
  return components.reduce<FC<{ children?: ReactNode }>>(
    (AccumulatedComponents, CurrentComponent) => {
      return ({ children }): JSX.Element => {
        return (
          <AccumulatedComponents>
            <CurrentComponent>{children}</CurrentComponent>
          </AccumulatedComponents>
        );
      };
    },
    ({ children }) => <>{children}</>,
  );
};

export const BaliseContextProvider = combineComponents(...providers);
