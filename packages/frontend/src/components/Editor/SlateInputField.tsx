import styled from '@emotion/styled';
import { Paper } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Editable, Slate } from 'slate-react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

import { Colors } from '../../constants/Colors';
import { EditorContext } from '../../contexts/EditorContext';
import { ENotificationType } from '../../contexts/types';
import { SlateElement, SlateLeaf } from '../../utils/slateEditorUtil';
import CheckIcon from '@mui/icons-material/Check';
import { DrawerWrapperProps } from '../NavBar/DesktopDrawer';
import { AppBarContext } from '../../contexts/AppBarContext';
import { useTranslation } from 'react-i18next';

export const SlateInputField = () => {
  const { t } = useTranslation(['common']);
  const { editor, value, valueHandler, kind } = useContext(EditorContext);
  const { openToolbar } = useContext(AppBarContext);
  const [slateValue, setSlateValue] = useState(JSON.parse(value));

  useEffect(() => {
    setSlateValue(JSON.parse(value));
  }, [value, kind]);

  const KindIcon = () => {
    switch (kind) {
      case ENotificationType.INFO:
        return <InfoOutlinedIcon />;
      case ENotificationType.WARNING:
        return <WarningAmberOutlinedIcon />;
      case ENotificationType.ERROR:
        return <ErrorOutlineOutlinedIcon />;
      case ENotificationType.CONFIRMATION:
        return <CheckIcon />;
      default:
        return <></>;
    }
  };

  const paperStyleByKind = () => {
    switch (kind) {
      case ENotificationType.INFO:
        return { backgroundColor: Colors.darkblue, color: Colors.white };
      case ENotificationType.WARNING:
        return { backgroundColor: Colors.yellow, color: Colors.extrablack };
      case ENotificationType.ERROR:
        return { backgroundColor: Colors.darkred, color: Colors.white };
      case ENotificationType.CONFIRMATION:
        return { backgroundColor: Colors.darkgreen, color: Colors.white };
      default:
        return {};
    }
  };

  const renderElement = useCallback((props: any) => <SlateElement {...props} />, []);
  const renderLeaf = useCallback((props: any) => <SlateLeaf {...props} />, []);

  return kind ? (
    <SlateInputFieldPaperWrapper elevation={2} sx={{ ...paperStyleByKind() }} opentoolbar={openToolbar}>
      <KindIcon />
      <Slate
        editor={editor}
        value={slateValue}
        onChange={(value: any) => {
          const isAstChange = editor.operations.some((op) => 'set_selection' !== op.type);
          if (isAstChange) {
            setSlateValue(value);
            valueHandler(JSON.stringify(value));
          }
        }}
      >
        <Editable
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          placeholder={t('common:edit.write_content')}
          readOnly={!openToolbar}
          style={{ cursor: openToolbar ? 'text' : 'default' }}
        />
      </Slate>
    </SlateInputFieldPaperWrapper>
  ) : (
    <></>
  );
};

const SlateInputFieldPaperWrapper = styled(Paper)<DrawerWrapperProps>(({ theme, opentoolbar }) => ({
  padding: '10px',
  boxShadow: 'none',
  border: opentoolbar ? `1px dashed ${Colors.darkblue}` : 'none',
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
