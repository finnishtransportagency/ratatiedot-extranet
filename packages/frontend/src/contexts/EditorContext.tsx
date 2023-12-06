import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation, useMatch } from 'react-router-dom';
import { Transforms, createEditor } from 'slate';
import { withReact } from 'slate-react';
import pipe from 'lodash/fp/pipe';

import { useGetCategoryPageContent } from '../hooks/query/GetCategoryPageContent';
import { isSlateValueEmpty } from '../utils/slateEditorUtil';
import withLinks from '../plugins/withLinks';
import { createParagraphNode } from '../utils/createSlateNode';
import { withHistory } from 'slate-history';
import { useGetNoticePageContent } from '../hooks/query/GetNoticePageContent';

export const createEditorWithPlugins = pipe(withReact, withHistory, withLinks);

export const EditorContext = React.createContext({
  editor: createEditorWithPlugins(createEditor()),
  value: [] as any,
  noticeFields: [] as any,
  valueHandler: (_: any) => {},
  valueReset: () => {},
  noticeFieldsHandler: (_: any) => {},
  noticeFieldsReset: () => {},
});

export type TSlateNode = { children: { text?: string; children?: any }[]; type?: string };
export const nodeTemplate: TSlateNode[] = [createParagraphNode()];
const noticeFieldsTemplate = {
  publishTimeStart: undefined,
  publishTimeEnd: undefined,
  showAsBanner: false,
  id: '',
};

export const EditorContextProvider = (props: any) => {
  const { pathname, state } = useLocation();
  const noticeRoute = useMatch('/ajankohtaista/:id');
  const noticeId = state?.noticeId;

  const { data } = useGetCategoryPageContent(pathname);
  const { data: noticeData } = useGetNoticePageContent(noticeId);

  const [editor, setEditor] = useState(createEditorWithPlugins(createEditor()));
  const [dbValue, setDBValue] = useState(nodeTemplate);
  const [value, setValue] = useState(nodeTemplate);
  const [noticeFields, setNoticeFields] = useState(noticeFieldsTemplate);

  useEffect(() => {
    const dataResponse = getPageData();
    // TODO: check if response data has slate editor's format
    if (dataResponse && dataResponse.length) {
      setDBValue(dataResponse);
      setValue(dataResponse);
    }
    const noticeResponse = getNoticeProperties();
    if (noticeResponse && Object.keys(noticeResponse).length) {
      const { content, ...noticeProperties } = noticeResponse;
      setNoticeFields(noticeProperties);
    }
  }, [data, noticeData]);

  const getPageData = () => {
    if (noticeRoute && noticeData && noticeData.content && !isEmpty(noticeData.content)) {
      return noticeData.content;
    }
    if (data && data.fields && !isEmpty(data.fields)) {
      return data.fields;
    }
    return nodeTemplate;
  };

  const getNoticeProperties = () => {
    if (noticeData && Object.keys(noticeData).length) {
      return noticeData;
    }
    return noticeFieldsTemplate;
  };

  const valueHandler = (v: any) => setValue(v);
  const noticeFieldsHandler = (v: any) => setNoticeFields(v);

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

  const noticeFieldsReset = () => {
    setNoticeFields(noticeFieldsTemplate);
  };

  return (
    <EditorContext.Provider
      value={{
        editor: editor,
        value: value,
        noticeFields: noticeFields,
        valueHandler: valueHandler,
        valueReset: valueReset,
        noticeFieldsHandler: noticeFieldsHandler,
        noticeFieldsReset: noticeFieldsReset,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  );
};
