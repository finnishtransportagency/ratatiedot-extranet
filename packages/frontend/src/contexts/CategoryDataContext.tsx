import React, { useState } from 'react';

export const CategoryDataContext = React.createContext({
  hasConfidentialContent: false,
  hasClassifiedContent: false,
  hasConfidentialContentHandler: (_: boolean) => {},
  hasClassifiedContentHandler: (_: boolean) => {},
});

export const CategoryDataContextProvider = (props: any) => {
  const [hasConfidentialContent, setHasConfidentialContent] = useState(false);
  const [hasClassifiedContent, setHasClassifiedContent] = useState(false);

  const hasConfidentialContentHandler = (hasConfidentialContent: boolean) => {
    setHasConfidentialContent(hasConfidentialContent);
  };

  const hasClassifiedContentHandler = (hasClassifiedContent: boolean) => {
    setHasClassifiedContent(hasClassifiedContent);
  };

  return (
    <CategoryDataContext.Provider
      value={{
        hasConfidentialContent: hasConfidentialContent,
        hasClassifiedContent: hasClassifiedContent,
        hasConfidentialContentHandler: hasConfidentialContentHandler,
        hasClassifiedContentHandler: hasClassifiedContentHandler,
      }}
    >
      {props.children}
    </CategoryDataContext.Provider>
  );
};
