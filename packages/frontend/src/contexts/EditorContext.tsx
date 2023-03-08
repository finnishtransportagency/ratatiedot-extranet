import React, { useState } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';

export const EditorContext = React.createContext({
  editor: withReact(createEditor()),
  value: '',
  valueHandler: (_: any) => {},
  valueReset: () => {},
  kind: '',
  kindHandler: (_: any) => {},
});

export type TSlateNode = { children: { text?: string; children?: any }[]; type?: string };
const initValue: TSlateNode[] = [{ children: [{ text: '' }] }];

export const EditorContextProvider = (props: any) => {
  const [kind, setKind] = useState('');
  const [editor, setEditor] = useState(() => withReact(createEditor()));
  const [value, setValue] = useState(JSON.stringify(initValue));

  const kindHandler = (k: string) => setKind(k);

  const valueHandler = (v: any) => setValue(v);

  const valueReset = () => {
    setValue(JSON.stringify(initValue));
    setEditor(() => withReact(createEditor()));
  };

  return (
    <EditorContext.Provider
      value={{
        editor: editor,
        value: value,
        valueHandler: valueHandler,
        valueReset: valueReset,
        kind: kind,
        kindHandler: kindHandler,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  );
};
