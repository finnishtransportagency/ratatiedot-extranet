import { FC } from 'react';
import { SearchContextProvider } from './SearchContext';
import { AppBarContextProvider } from './AppBarContext';
import { MenuContextProvider } from './MenuContext';
import { EditorContextProvider } from './EditorContext';

const providers = [SearchContextProvider, AppBarContextProvider, MenuContextProvider, EditorContextProvider];

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
