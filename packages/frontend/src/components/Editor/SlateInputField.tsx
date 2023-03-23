import styled from '@emotion/styled';
import { Paper } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Editable, ReactEditor, Slate } from 'slate-react';

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

  useEffect(() => {
    setSlateValue(value);
  }, [value]);

  const renderElement = useCallback((props: any) => <SlateElement {...props} />, []);
  const renderLeaf = useCallback((props: any) => <SlateLeaf {...props} />, []);

  const isNotificationSlateOpened = openToolbar && ReactEditor.isFocused(editor);

  return (
    <SlateInputFieldPaperWrapper elevation={2} opentoolbar={isNotificationSlateOpened}>
      <Slate
        editor={editor}
        value={slateValue}
        onChange={(value: any) => {
          const isAstChange = editor.operations.some((op: any) => 'set_selection' !== op.type);
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
          placeholder={isNotificationSlateOpened ? t('common:edit.write_content') : ''}
          readOnly={!isNotificationSlateOpened}
          style={{ cursor: isNotificationSlateOpened ? 'text' : 'default' }}
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
