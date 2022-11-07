import { FC } from 'react';
import { SearchContextProvider } from './SearchContext';

const providers = [SearchContextProvider];

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
