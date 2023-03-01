import styled from '@emotion/styled';
import { useSlate } from 'slate-react';
import { Box, Divider, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import DeleteIcon from '../../assets/icons/Delete.svg';
import CloseIcon from '../../assets/icons/Close.svg';

import { isBlockActive, isMarkActive, toggleBlock, toggleMark } from '../../utils/slateEditorUtil';
import { Colors } from '../../constants/Colors';
import { ElementType, FontFormatType } from '../../utils/types';
import { NotificationTypes } from './NotificationTypes';
import { useContext } from 'react';
import { AppBarContext } from '../../contexts/AppBarContext';
import { EditorContext } from '../../contexts/EditorContext';

type MarkButtonProps = {
  format: FontFormatType;
  icon: any;
};

type BlockButtonProps = {
  format: ElementType;
  icon: any;
};

const MarkButton = ({ format, icon }: MarkButtonProps) => {
  const editor = useSlate();
  return (
    <ToggleButton
      value={format}
      selected={isMarkActive(editor, format)}
      onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </ToggleButton>
  );
};

const BlockButton = ({ format, icon }: BlockButtonProps) => {
  const editor = useSlate();
  return (
    <ToggleButton
      value={format}
      selected={isBlockActive(editor, format)}
      onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {icon}
    </ToggleButton>
  );
};

export const SlateToolbar = () => {
  const { closeToolbarHandler } = useContext(AppBarContext);

  return (
    <ToolbarPaperWrapper elevation={2}>
      <ToggleButtonGroupWrapper size="small">
        {BlockButton({ format: ElementType.HEADING_ONE, icon: <FormatSizeIcon fontSize="large" /> })}
        {BlockButton({ format: ElementType.HEADING_TWO, icon: <FormatSizeIcon fontSize="medium" /> })}
        {BlockButton({ format: ElementType.PARAGRAPH, icon: <FormatSizeIcon fontSize="small" /> })}
        {MarkButton({ format: FontFormatType.BOLD, icon: <FormatBoldIcon fontSize="small" /> })}
        {MarkButton({ format: FontFormatType.ITALIC, icon: <FormatItalicIcon fontSize="small" /> })}
        {MarkButton({ format: FontFormatType.UNDERLINED, icon: <FormatUnderlinedIcon fontSize="small" /> })}
        {BlockButton({ format: ElementType.NUMBERED_LIST, icon: <FormatListNumberedIcon fontSize="small" /> })}
        {BlockButton({ format: ElementType.BULLET_LIST, icon: <FormatListBulletedIcon fontSize="small" /> })}
        {BlockButton({ format: ElementType.LINK, icon: <InsertLinkIcon fontSize="small" /> })}
      </ToggleButtonGroupWrapper>
      <DividerWrapper orientation="vertical" variant="middle" flexItem />
      <NotificationTypes />
      <DividerWrapper orientation="vertical" variant="middle" flexItem />
      <Box
        component="img"
        sx={{ cursor: 'pointer' }}
        src={DeleteIcon}
        alt="delete"
        onClick={() => console.log('//TODO:')}
      />
      <Box
        component="img"
        sx={{ cursor: 'pointer', marginLeft: 'auto' }}
        src={CloseIcon}
        alt="close"
        onClick={closeToolbarHandler}
      />
    </ToolbarPaperWrapper>
  );
};

const ToolbarPaperWrapper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  borderRadius: 0,
  boxShadow: 'none',
  flexWrap: 'wrap',
  backgroundColor: Colors.aliceblue,
  borderBottom: `1px dashed ${Colors.darkblue}`,
  padding: '16px 15px',
}));

const ToggleButtonGroupWrapper = styled(ToggleButtonGroup)(() => ({
  '.MuiToggleButton-root': { border: 'none' },
}));

const DividerWrapper = styled(Divider)(({ theme }) => ({
  margin: '0 27px',
  [theme.breakpoints.down('desktop')]: {
    display: 'none',
  },
}));
