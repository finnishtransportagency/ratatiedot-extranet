import { cloneDeep, isEmpty, isEqual } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useMatch, useParams } from 'react-router-dom';
import { Editor, Transforms, createEditor } from 'slate';
import { withReact } from 'slate-react';
import pipe from 'lodash/fp/pipe';

import { useGetCategoryPageContent } from '../hooks/query/GetCategoryPageContent';
import withLinks from '../plugins/withLinks';
import { createParagraphNode } from '../utils/createSlateNode';
import { HistoryEditor, withHistory } from 'slate-history';
import { useGetNoticePageContent } from '../hooks/query/GetNoticePageContent';

export const createEditorWithPlugins = pipe(withReact, withHistory, withLinks);

export type TSlateNode = {
  children: (TSlateNode | { text: string; children?: never })[];
  text?: never;
  type?: string;
};

type NoticeFields = {
  publishTimeStart?: string | Date | null;
  publishTimeEnd?: string | Date | null;
  showAsBanner: boolean;
  id: string;
  title?: string | null;
};

type EditorContextValue = {
  editor: ReturnType<typeof createEditorWithPlugins>;
  value: TSlateNode[];
  noticeFields: NoticeFields;
  selectedImage: File | undefined;
  valueHandler: (value: TSlateNode[]) => void;
  valueReset: () => void;
  hasUnsavedChanges: boolean;
  markSaved: (submittedValue: TSlateNode[]) => void;
  noticeFieldsHandler: (fields: NoticeFields) => void;
  noticeFieldsReset: () => void;
  selectedImageHandler: (image: File | undefined) => void;
};

export const EditorContext = React.createContext<EditorContextValue>({
  editor: createEditorWithPlugins(createEditor()),
  value: [],
  noticeFields: { showAsBanner: false, id: '' },
  selectedImage: undefined,
  valueHandler: () => {},
  valueReset: () => {},
  hasUnsavedChanges: false,
  markSaved: () => {},
  noticeFieldsHandler: () => {},
  noticeFieldsReset: () => {},
  selectedImageHandler: () => {},
});

export const nodeTemplate: TSlateNode[] = [createParagraphNode()];
const noticeFieldsTemplate: NoticeFields = {
  publishTimeStart: undefined,
  publishTimeEnd: undefined,
  showAsBanner: false,
  id: '',
};

export const EditorContextProvider = (props: React.PropsWithChildren) => {
  const { pathname } = useLocation();
  const noticeRoute = useMatch('/ajankohtaista/:id/:date');
  const { id: noticeId } = useParams();

  const { data } = useGetCategoryPageContent(pathname);
  const { data: noticeData } = useGetNoticePageContent(noticeId!);

  const [editor] = useState(() => createEditorWithPlugins(createEditor()));
  const [dbValue, setDBValue] = useState(nodeTemplate);
  const [value, setValue] = useState(nodeTemplate);
  const documentState = useRef({ pathname, value: nodeTemplate, savedValue: nodeTemplate });
  const [noticeFields, setNoticeFields] = useState(noticeFieldsTemplate);
  const [selectedImage, setSelectedImage] = useState<File>();

  const replaceDocument = (document: TSlateNode[]) => {
    const nextValue = cloneDeep(document);
    documentState.current.value = nextValue;
    setValue(nextValue);
    HistoryEditor.withoutSaving(editor, () => {
      Editor.withoutNormalizing(editor, () => {
        Transforms.deselect(editor);
        for (let index = editor.children.length - 1; index >= 0; index--) {
          Transforms.removeNodes(editor, { at: [index] });
        }
        Transforms.insertNodes(editor, cloneDeep(nextValue), { at: [0] });
      });
    });
    editor.history = { undos: [], redos: [] };
  };

  useEffect(() => {
    const previous = documentState.current;
    if (previous.pathname === pathname && !isEqual(previous.value, previous.savedValue)) {
      return;
    }
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

    const dataResponse = getPageData();
    // TODO: check if response data has slate editor's format
    if (dataResponse && dataResponse.length) {
      const savedValue = cloneDeep(dataResponse);
      documentState.current = { pathname, value: savedValue, savedValue };
      setDBValue(savedValue);
      replaceDocument(savedValue);
    }
    const noticeResponse = getNoticeProperties();
    if (noticeResponse && Object.keys(noticeResponse).length) {
      const { publishTimeStart, publishTimeEnd, showAsBanner, id, title } = noticeResponse;
      setNoticeFields({ publishTimeStart, publishTimeEnd, showAsBanner, id, title });
    }
  }, [data, editor, noticeData, Boolean(noticeRoute), pathname]);

  const valueHandler = (nextValue: TSlateNode[]) => {
    documentState.current.value = nextValue;
    setValue(nextValue);
  };
  const markSaved = (submittedValue: TSlateNode[]) => {
    if (documentState.current.pathname !== pathname) {
      return;
    }
    const savedValue = cloneDeep(submittedValue);
    documentState.current.savedValue = savedValue;
    setDBValue(savedValue);
  };
  const noticeFieldsHandler = (fields: NoticeFields) => setNoticeFields(fields);
  const selectedImageHandler = (image: File | undefined) => setSelectedImage(image);

  const valueReset = () => {
    replaceDocument(dbValue);
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
        selectedImage: selectedImage,
        valueHandler: valueHandler,
        valueReset: valueReset,
        hasUnsavedChanges: !isEqual(value, dbValue),
        markSaved: markSaved,
        noticeFieldsHandler: noticeFieldsHandler,
        noticeFieldsReset: noticeFieldsReset,
        selectedImageHandler: selectedImageHandler,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  );
};
