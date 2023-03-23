import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import pipe from 'lodash/fp/pipe';

import { useGetCategoryPageContent } from '../hooks/query/GetCategoryPageContent';
import { getRouterName } from '../utils/helpers';
import { isSlateValueEmpty, openNotification } from '../utils/slateEditorUtil';
import { ElementType } from '../utils/types';
import withLinks from '../plugins/withLinks';

const createEditorWithPlugins = pipe(withReact, withLinks);

export const EditorContext = React.createContext({
  editor: createEditorWithPlugins(createEditor()),
  value: [] as any,
  valueHandler: (_: any) => {},
  valueReset: () => {},
});

export type TSlateNode = { children: { text?: string; children?: any }[]; type?: string };
const nodeTemplate: TSlateNode[] = [{ children: [{ text: '' }] }];

export const EditorContextProvider = (props: any) => {
  const { pathname } = useLocation();
  const categoryName = pathname.split('/').at(-1) || '';
  const { data } = useGetCategoryPageContent(getRouterName(categoryName));

  const [editor, setEditor] = useState(createEditorWithPlugins(createEditor()));
  const [dbValue, setDBValue] = useState(nodeTemplate);
  const [value, setValue] = useState(nodeTemplate);

  useEffect(() => {
    const dataResponse = getNotificationData();
    // TODO: check if response data has slate editor's format
    if (dataResponse && dataResponse.length) {
      setDBValue(dataResponse);
      setValue(dataResponse);
    }
  }, [data]);

  const getNotificationData = () => {
    if (data && data.fields && !isEmpty(data.fields)) {
      return data.fields.filter((field: any) => {
        return field.type ? field.type.indexOf('notification') !== -1 : field;
      });
    }
    return nodeTemplate;
  };

  const valueHandler = (v: any) => setValue(v);

  const valueReset = () => {
    if (isSlateValueEmpty(dbValue)) {
      setValue(nodeTemplate);
      setEditor(withReact(createEditor()));
    } else {
      // Directly assign initial data from database to editor's children
      const dbNotificationType = dbValue[0].type;
      editor.children = dbValue as any;
      openNotification(editor, dbNotificationType as ElementType);
    }
  };

  return (
    <EditorContext.Provider
      value={{
        editor: editor,
        value: value,
        valueHandler: valueHandler,
        valueReset: valueReset,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  );
};
