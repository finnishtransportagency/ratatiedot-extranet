import styled from '@emotion/styled';
import { Paper } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Editable, Slate } from 'slate-react';

import { Colors } from '../../constants/Colors';
import { EditorContext } from '../../contexts/EditorContext';
import { ENotificationType } from '../../contexts/types';
import { SlateElement, SlateLeaf } from '../../utils/slateEditorUtil';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import CheckIcon from '@mui/icons-material/Check';

export const SlateInputField = () => {
  const { editor, value, valueHandler, kind } = useContext(EditorContext);
  const [slateValue, setSlateValue] = useState(JSON.parse(value));

  useEffect(() => {
    setSlateValue(JSON.parse(value));
  }, [value]);

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
    <SlateInputFieldPaperWrapper elevation={2} sx={{ ...paperStyleByKind() }}>
      <KindIcon />
      <Slate
        editor={editor}
        value={slateValue}
        onChange={(value: any) => {
          setSlateValue(value);
          valueHandler(JSON.stringify(value));
        }}
      >
        <Editable renderLeaf={renderLeaf} renderElement={renderElement} />
      </Slate>
    </SlateInputFieldPaperWrapper>
  ) : (
    <></>
  );
};

const SlateInputFieldPaperWrapper = styled(Paper)(({ theme }) => ({
  padding: '10px',
  boxShadow: 'none',
  border: `1px dashed ${Colors.darkblue}`,
  [theme.breakpoints.only('mobile')]: {
    margin: '0 15px',
  },
  [theme.breakpoints.only('tablet')]: {
    margin: '0 32px',
  },
  [theme.breakpoints.only('desktop')]: {
    margin: '30px 40px',
  },
}));
