import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Transforms, createEditor } from 'slate';
import { withReact } from 'slate-react';
import pipe from 'lodash/fp/pipe';

import { useGetCategoryPageContent } from '../hooks/query/GetCategoryPageContent';
import { getRouterName } from '../utils/helpers';
import { isSlateValueEmpty, openNotification } from '../utils/slateEditorUtil';
import withLinks from '../plugins/withLinks';
import { createParagraphNode } from '../utils/createSlateNode';
import { withHistory } from 'slate-history';

export const createEditorWithPlugins = pipe(withReact, withHistory, withLinks);

export const EditorContext = React.createContext({
  editor: createEditorWithPlugins(createEditor()),
  value: [] as any,
  valueHandler: (_: any) => {},
  valueReset: () => {},
});

export type TSlateNode = { children: { text?: string; children?: any }[]; type?: string };
export const nodeTemplate: TSlateNode[] = [createParagraphNode()];

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
      return data.fields;
    }
    return nodeTemplate;
  };

  const valueHandler = (v: any) => setValue(v);

  const valueReset = () => {
    if (isSlateValueEmpty(dbValue)) {
      setValue(nodeTemplate);
      setEditor(createEditorWithPlugins(createEditor()));
    } else {
      editor.children.map(() => {
        Transforms.delete(editor, { at: [0] });
      });
      editor.children = dbValue as any;
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
