import styled from '@emotion/styled';
import { Box, Divider, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import { Slate } from 'slate-react';

import DeleteIcon from '../../assets/icons/Delete.svg';
import CloseIcon from '../../assets/icons/Close.svg';
import { isBlockActive, isMarkActive, toggleBlock, toggleMark } from '../../utils/slateEditorUtil';
import { Colors } from '../../constants/Colors';
import { ElementType, FontFormatType } from '../../utils/types';
import { NotificationTypes } from './NotificationTypes';
import { useContext } from 'react';
import { AppBarContext } from '../../contexts/AppBarContext';
import { EditorContext } from '../../contexts/EditorContext';

type MarkButtonProps = { editor: any; format: FontFormatType; icon: any };

type BlockButtonProps = {
  editor: any;
  format: ElementType;
  icon: any;
};

const MarkButton = ({ editor, format, icon }: MarkButtonProps) => {
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

const BlockButton = ({ editor, format, icon }: BlockButtonProps) => {
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
  const { editor, value, valueReset, kindHandler } = useContext(EditorContext);

  const removeNotificationOrContentType = () => {
    kindHandler('');
    valueReset();
  };

  return (
    <Slate editor={editor} value={JSON.parse(value)}>
      <ToolbarPaperWrapper elevation={2}>
        <ToggleButtonGroupWrapper size="small">
          {BlockButton({
            editor,
            format: ElementType.PARAGRAPH_TWO,
            icon: <FormatSizeIcon sx={{ fontSize: '16px' }} />,
          })}
          {BlockButton({
            editor,
            format: ElementType.PARAGRAPH_ONE,
            icon: <FormatSizeIcon sx={{ fontSize: '18px' }} />,
          })}
          {BlockButton({ editor, format: ElementType.HEADING_TWO, icon: <FormatSizeIcon sx={{ fontSize: '20px' }} /> })}
          {BlockButton({ editor, format: ElementType.HEADING_ONE, icon: <FormatSizeIcon sx={{ fontSize: '23px' }} /> })}
          {MarkButton({ editor, format: FontFormatType.BOLD, icon: <FormatBoldIcon fontSize="small" /> })}
          {MarkButton({ editor, format: FontFormatType.ITALIC, icon: <FormatItalicIcon fontSize="small" /> })}
          {MarkButton({ editor, format: FontFormatType.UNDERLINED, icon: <FormatUnderlinedIcon fontSize="small" /> })}
          {BlockButton({
            editor,
            format: ElementType.NUMBERED_LIST,
            icon: <FormatListNumberedIcon fontSize="small" />,
          })}
          {BlockButton({ editor, format: ElementType.BULLET_LIST, icon: <FormatListBulletedIcon fontSize="small" /> })}
          {BlockButton({ editor, format: ElementType.LINK, icon: <InsertLinkIcon fontSize="small" /> })}
        </ToggleButtonGroupWrapper>
        <DividerWrapper orientation="vertical" variant="middle" flexItem />
        <NotificationTypes />
        <DividerWrapper orientation="vertical" variant="middle" flexItem />
        <Box
          component="img"
          sx={{ cursor: 'pointer' }}
          src={DeleteIcon}
          alt="delete"
          onClick={removeNotificationOrContentType}
        />
        <Box
          component="img"
          sx={{ cursor: 'pointer', marginLeft: 'auto' }}
          src={CloseIcon}
          alt="close"
          onClick={closeToolbarHandler}
        />
      </ToolbarPaperWrapper>
    </Slate>
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