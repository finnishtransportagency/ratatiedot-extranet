import styled from '@emotion/styled';
import { Paper } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Editable, ReactEditor, RenderElementProps, RenderLeafProps, Slate } from 'slate-react';
import { Editor, Operation, Transforms } from 'slate';

import { Colors } from '../../constants/Colors';
import { EditorContext, TSlateNode } from '../../contexts/EditorContext';
import { SlateElement, SlateElementProps, SlateLeaf } from '../../utils/slateEditorUtil';
import { DrawerWrapperProps } from '../NavBar/DesktopDrawer';
import { AppBarContext } from '../../contexts/AppBarContext';
import { useTranslation } from 'react-i18next';

export const SlateInputField = () => {
  const { t } = useTranslation(['common']);
  const { editor, value, valueHandler } = useContext(EditorContext);
  const { openToolbar } = useContext(AppBarContext);

  const [slateValue, setSlateValue] = useState(value);

  useEffect(() => {
    if (openToolbar) {
      if (!ReactEditor.isFocused(editor)) {
        ReactEditor.focus(editor);
      }
      Transforms.select(editor, Editor.end(editor, []));
    }
  }, [editor, openToolbar]);

  useEffect(() => {
    setSlateValue(value);
  }, [value]);

  const renderElement = useCallback(
    (props: RenderElementProps) => <SlateElement {...props} element={props.element as SlateElementProps['element']} />,
    [],
  );
  const renderLeaf = useCallback((props: RenderLeafProps) => <SlateLeaf {...props} />, []);

  return (
    <SlateInputFieldPaperWrapper data-testid="slate-editor" elevation={2} opentoolbar={openToolbar}>
      <Slate
        editor={editor}
        initialValue={slateValue}
        onChange={(value) => {
          const isAstChange = editor.operations.some((op: Operation) => 'set_selection' !== op.type);
          if (isAstChange) {
            const nextValue = value as TSlateNode[];
            setSlateValue(nextValue);
            valueHandler(nextValue);
          }
        }}
      >
        <Editable
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          placeholder={openToolbar ? t('common:edit.write_content') : ''}
          readOnly={!openToolbar}
          style={{ cursor: openToolbar ? 'text' : 'default' }}
        />
      </Slate>
    </SlateInputFieldPaperWrapper>
  );
};

const SlateInputFieldPaperWrapper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'opentoolbar',
})<DrawerWrapperProps>(({ theme, opentoolbar }) => ({
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
