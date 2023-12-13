import { FC } from 'react';
import { AppBarContextProvider } from './AppBarContext';
import { MenuContextProvider } from './MenuContext';
import { EditorContextProvider } from './EditorContext';
import { CategoryDataContextProvider } from './CategoryDataContext';
import { ErrorContextProvider } from './ErrorContext';

const providers = [
  AppBarContextProvider,
  MenuContextProvider,
  EditorContextProvider,
  CategoryDataContextProvider,
  ErrorContextProvider,
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

export const AppContextProvider = combineComponents(...providers);
