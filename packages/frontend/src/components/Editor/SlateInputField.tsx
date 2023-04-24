import styled from '@emotion/styled';
import { Paper } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Editable, ReactEditor, Slate } from 'slate-react';
import { Editor, Operation, Transforms } from 'slate';

import { Colors } from '../../constants/Colors';
import { EditorContext } from '../../contexts/EditorContext';
import { SlateElement, SlateLeaf } from '../../utils/slateEditorUtil';
import { DrawerWrapperProps } from '../NavBar/DesktopDrawer';
import { AppBarContext } from '../../contexts/AppBarContext';
import { useTranslation } from 'react-i18next';

export const SlateInputField = () => {
  const { t } = useTranslation(['common']);
  const { editor, value, valueHandler } = useContext(EditorContext);
  const { openToolbar } = useContext(AppBarContext);

  const [slateValue, setSlateValue] = useState(value);
  const [isEditorOpened, setIsEditorOpened] = useState(false);

  useEffect(() => {
    if (openToolbar) {
      if (!ReactEditor.isFocused(editor)) {
        refocusEditor(editor);
      }
    } else {
      setIsEditorOpened(false);
    }
  }, [openToolbar]);

  const refocusEditor = (editor: any) => {
    ReactEditor.focus(editor);
    Transforms.select(editor, Editor.end(editor, []));
    if (ReactEditor.isFocused(editor)) {
      setIsEditorOpened(true);
    } else {
      setIsEditorOpened(false);
    }
  };

  useEffect(() => {
    setSlateValue(value);
  }, [value]);

  const renderElement = useCallback((props: any) => <SlateElement {...props} />, []);
  const renderLeaf = useCallback((props: any) => <SlateLeaf {...props} />, []);

  return (
    <SlateInputFieldPaperWrapper data-testid="slate-editor" elevation={2} opentoolbar={isEditorOpened}>
      <Slate
        editor={editor}
        value={slateValue}
        onChange={(value: any) => {
          const isAstChange = editor.operations.some((op: Operation) => 'set_selection' !== op.type);
          if (isAstChange) {
            setSlateValue(value);
            valueHandler(value);
          }
        }}
      >
        <Editable
          autoFocus={true}
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          placeholder={isEditorOpened ? t('common:edit.write_content') : ''}
          readOnly={!isEditorOpened}
          style={{ cursor: isEditorOpened ? 'text' : 'default' }}
        />
      </Slate>
    </SlateInputFieldPaperWrapper>
  );
};

const SlateInputFieldPaperWrapper = styled(Paper)<DrawerWrapperProps>(({ theme, opentoolbar }) => ({
  boxShadow: 'none',
  border: opentoolbar ? `1px dashed ${Colors.darkblue}` : 'none',
  padding: opentoolbar ? '10px' : 0,
  [theme.breakpoints.only('mobile')]: {
    margin: '0 15px',
  },
  [theme.breakpoints.only('tablet')]: {
    margin: '0 32px',
  },
  [theme.breakpoints.only('desktop')]: {
    margin: '60px 40px 0px 40px',
  },
}));
