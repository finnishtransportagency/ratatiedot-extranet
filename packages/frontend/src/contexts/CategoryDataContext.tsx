import React, { useState } from 'react';

export const CategoryDataContext = React.createContext({
  hasConfidentialContent: false,
  hasConfidentialContentHandler: (_: boolean) => {},
});

export const CategoryDataContextProvider = (props: any) => {
  const [hasConfidentialContent, setHasConfidentialContent] = useState(false);

  const hasConfidentialContentHandler = (hasConfidentialContent: boolean) => {
    setHasConfidentialContent(hasConfidentialContent);
  };

  return (
    <CategoryDataContext.Provider
      value={{
        hasConfidentialContent: hasConfidentialContent,
        hasConfidentialContentHandler: hasConfidentialContentHandler,
      }}
    >
      {props.children}
    </CategoryDataContext.Provider>
  );
};
