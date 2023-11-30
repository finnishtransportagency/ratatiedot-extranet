import styled from '@emotion/styled';
import { Box, Divider, IconButton, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { Slate } from 'slate-react';

import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '../../assets/icons/Close.svg';
import LinkIcon from '../../assets/icons/Link.svg';
import PaletteIcon from '../../assets/icons/Palette.svg';
import { insertLink, isBlockActive, isMarkActive, toggleBlock, toggleMark } from '../../utils/slateEditorUtil';
import { Colors } from '../../constants/Colors';
import { ElementType, FontFormatType } from '../../utils/types';
import { NotificationTypes } from './NotificationTypes';
import { useContext, useEffect, useState } from 'react';
import { AppBarContext } from '../../contexts/AppBarContext';
import { EditorContext } from '../../contexts/EditorContext';
import { useTranslation } from 'react-i18next';
import { EditorColorPicker } from './Popup/EditorColorPicker';
import { ContentTypes } from './ContentTypes';
import { FontSizeDropdown } from './Dropdown/FontSizeDropdown';
import { ButtonWrapper } from './ConfirmationAppBar';
import { useUpdatePageContents } from '../../hooks/mutations/UpdateCategoryPageContent';
import { getRouterName } from '../../utils/helpers';
import { useLocation, useMatch } from 'react-router-dom';
import { toast } from 'react-toastify';
import { isEqual } from 'lodash';
import { HistoryEditor } from 'slate-history';
import { useUpdateNoticePageContents } from '../../hooks/mutations/UpdateNoticePageContent';

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
  const { closeToolbarHandler, closeToolbarWithoutSaveHandler } = useContext(AppBarContext);
  const { editor, value, valueReset, noticeFields } = useContext(EditorContext);
  const [isColorOpened, setIsColorOpened] = useState(false);
  const [initialValue, setInitialValue] = useState([]);
  const { pathname } = useLocation();
  const categoryName = pathname.split('/').at(-1) || '';
  const noticeRoute = useMatch('/ajankohtaista/:id');

  const mutatePageContents = useUpdatePageContents(getRouterName(categoryName));
  const mutateNoticePageContents = useUpdateNoticePageContents(categoryName);

  const { error } = mutatePageContents;

  useEffect(() => {
    setInitialValue(value);
  }, []);
  const handleInsertLink = () => {
    const url = prompt(t('common:edit.enter_url'));
    if (!url) return;
    insertLink(editor, url);
  };

  const toggleColorPicker = () => setIsColorOpened(!isColorOpened);

  const handleSave = () => {
    if (noticeRoute) {
      console.log('Save on noticeRoute');
      mutateNoticePageContents.mutate(
        { value, noticeFields },
        {
          onSuccess: () => {
            toast(t('common:edit.saved_success'), { type: 'success' });
            setInitialValue(value);
          },
          onError: () => {
            toast(error ? error.message : t('common:edit.saved_failure'), { type: 'error' });
          },
        },
      );
    } else {
      mutatePageContents.mutate(value, {
        onSuccess: () => {
          toast(t('common:edit.saved_success'), { type: 'success' });
          setInitialValue(value);
        },
        onError: () => {
          toast(error ? error.message : t('common:edit.saved_failure'), { type: 'error' });
        },
      });
    }
  };

  const handleClose = () => {
    if (isEqual(initialValue, value)) {
      closeToolbarWithoutSaveHandler();
    } else {
      closeToolbarHandler();
    }
  };

  return (
    <Slate editor={editor} initialValue={value}>
      <ToolbarPaperWrapper elevation={2} aria-label={t('common:edit.toolbar')}>
        <FontSizeDropdown />
        <DividerWrapper orientation="vertical" variant="middle" flexItem />
        <IconButton onClick={() => HistoryEditor.undo(editor)}>
          <UndoIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={() => HistoryEditor.redo(editor)}>
          <RedoIcon fontSize="small" />
        </IconButton>
        <DividerWrapper orientation="vertical" variant="middle" flexItem />
        <ToggleButtonGroupWrapper size="small">
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
        <ButtonWrapper onClick={valueReset}>{t('common:action.reject')}</ButtonWrapper>
        <ButtonWrapper variant="contained" onClick={handleSave}>
          <CheckIcon fontSize="small" />
          {t('common:action.save')}
        </ButtonWrapper>
        <Box
          aria-label={t('common:action.close')}
          component="img"
          sx={{ cursor: 'pointer', marginLeft: 'auto' }}
          src={CloseIcon}
          alt="close"
          onClick={handleClose}
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
