import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { useGetCategoryPageContent } from '../hooks/query/GetCategoryPageContent';
import { getRouterName } from '../utils/helpers';

export const EditorContext = React.createContext({
  editor: withReact(createEditor()),
  value: '',
  valueHandler: (_: any) => {},
  valueReset: () => {},
  notificationType: '',
  notificationTypeHandler: (_: any) => {},
});

export type TSlateNode = { children: { text?: string; children?: any }[]; type?: string };
const initValue: TSlateNode[] = [{ children: [{ text: '' }] }];

export const EditorContextProvider = (props: any) => {
  const { pathname } = useLocation();
  const categoryName = pathname.split('/').at(-1) || '';
  const { data } = useGetCategoryPageContent(getRouterName(categoryName));

  const [notificationType, setNotificationType] = useState('');
  const [editor, setEditor] = useState(() => withReact(createEditor()));
  const [value, setValue] = useState(() => {
    return JSON.stringify(initValue);
  });

  useEffect(() => {
    if (data) {
      const dataResponse = data.fields.filter((field: any) => {
        return field.type.indexOf('notification') !== -1;
      });
      setValue(JSON.stringify(dataResponse));
    }
  }, [data]);

  const notificationTypeHandler = (k: string) => setNotificationType(k);

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
        notificationType: notificationType,
        notificationTypeHandler: notificationTypeHandler,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  );
};
