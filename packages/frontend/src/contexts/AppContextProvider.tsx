import { FC, ReactNode } from 'react';
import { AppBarContextProvider } from './AppBarContext';
import { MenuContextProvider } from './MenuContext';
import { EditorContextProvider } from './EditorContext';
import { CategoryDataContextProvider } from './CategoryDataContext';
import { ErrorContextProvider } from './ErrorContext';
import { BalisePermissionsProvider } from '../modules/balise/contexts/BalisePermissionsContext';
import { EditorNavigationGuard } from '../components/Editor/EditorNavigationGuard';

const providers = [
  AppBarContextProvider,
  BalisePermissionsProvider,
  MenuContextProvider,
  EditorContextProvider,
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

const CombinedProviders = combineComponents(...providers);

export const AppContextProvider: FC<{ children?: ReactNode }> = ({ children }) => (
  <CombinedProviders>
    <EditorNavigationGuard />
    {children}
  </CombinedProviders>
);
