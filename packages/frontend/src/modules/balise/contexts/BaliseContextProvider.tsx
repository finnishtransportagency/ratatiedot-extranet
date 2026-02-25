import { FC, ReactNode } from 'react';
import { AppBarContextProvider } from '../../../contexts/AppBarContext';
import { MenuContextProvider } from '../../../contexts/MenuContext';
import { CategoryDataContextProvider } from '../../../contexts/CategoryDataContext';
import { ErrorContextProvider } from '../../../contexts/ErrorContext';
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
