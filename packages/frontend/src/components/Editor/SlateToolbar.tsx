import styled from '@emotion/styled';
import { Box, Divider, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { Slate } from 'slate-react';

import CloseIcon from '../../assets/icons/Close.svg';
import LinkIcon from '../../assets/icons/Link.svg';
import PaletteIcon from '../../assets/icons/Palette.svg';
import { insertLink, isBlockActive, isMarkActive, toggleBlock, toggleMark } from '../../utils/slateEditorUtil';
import { Colors } from '../../constants/Colors';
import { ElementType, FontFormatType } from '../../utils/types';
import { NotificationTypes } from './NotificationTypes';
import { useContext, useState } from 'react';
import { AppBarContext } from '../../contexts/AppBarContext';
import { EditorContext } from '../../contexts/EditorContext';
import { useTranslation } from 'react-i18next';
import { EditorColorPicker } from './Popup/EditorColorPicker';
import { ContentTypes } from './ContentTypes';

type MarkButtonProps = { editor: any; format: FontFormatType; icon: any };

type BlockButtonProps = {
  editor: any;
  format: ElementType;
  icon: any;
};

const MarkButton = ({ editor, format, icon }: MarkButtonProps) => {
  const { t } = useTranslation(['common']);

  return (
    <ToggleButton
      aria-label={t(`common:font.${format}`)}
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
  const { t } = useTranslation(['common']);

  return (
    <ToggleButton
      aria-label={t(`common:element.${format}`)}
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
  const { t } = useTranslation(['common']);
  const { closeToolbarHandler } = useContext(AppBarContext);
  const { editor, value } = useContext(EditorContext);
  const [isColorOpened, setIsColorOpened] = useState(false);

  const handleInsertLink = () => {
    const url = prompt(t('common:edit.enter_url'));
    if (!url) return;
    insertLink(editor, url);
  };

  const toggleColorPicker = () => setIsColorOpened(!isColorOpened);

  return (
    <Slate editor={editor} value={value}>
      <ToolbarPaperWrapper elevation={2} aria-label={t('common:edit.toolbar')}>
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
          <Box
            aria-label={t('common:edit.insert_link')}
            component="img"
            sx={{ cursor: 'pointer', width: '25px', padding: '7px' }}
            src={LinkIcon}
            alt="link"
            onClick={handleInsertLink}
          />
          {BlockButton({
            editor,
            format: ElementType.NUMBERED_LIST,
            icon: <FormatListNumberedIcon fontSize="small" />,
          })}
          {BlockButton({ editor, format: ElementType.BULLET_LIST, icon: <FormatListBulletedIcon fontSize="small" /> })}
        </ToggleButtonGroupWrapper>
        <DividerWrapper orientation="vertical" variant="middle" flexItem />
        <Box
          aria-label={t('common:edit.color')}
          component="img"
          sx={{ cursor: 'pointer', width: '25px' }}
          src={PaletteIcon}
          alt="color"
          onClick={toggleColorPicker}
        />
        {isColorOpened && (
          <ToggleButtonGroupWrapper size="small">
            <EditorColorPicker onClose={toggleColorPicker} />
          </ToggleButtonGroupWrapper>
        )}
        <DividerWrapper orientation="vertical" variant="middle" flexItem />
        <NotificationTypes />
        <DividerWrapper orientation="vertical" variant="middle" flexItem />
        <ContentTypes />
        <DividerWrapper orientation="vertical" variant="middle" flexItem />
        <Box
          aria-label={t('common:action.close')}
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
