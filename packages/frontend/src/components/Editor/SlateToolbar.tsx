import styled from '@emotion/styled';
import { Divider, IconButton, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import LinkIcon from '../../assets/icons/Link.svg';
import PaletteIcon from '../../assets/icons/Palette.svg';
import { insertLink, isBlockActive, isMarkActive, toggleBlock, toggleMark } from '../../utils/slateEditorUtil';
import { Colors } from '../../constants/Colors';
import { ElementType, FontFormatType } from '../../utils/types';
import { NotificationTypes } from './NotificationTypes';
import { ReactNode, useContext, useState } from 'react';
import { ReactEditor } from 'slate-react';
import { AppBarContext } from '../../contexts/AppBarContext';
import { EditorContext } from '../../contexts/EditorContext';
import { useTranslation } from 'react-i18next';
import { EditorColorPicker } from './Popup/EditorColorPicker';
import { ContentTypes } from './ContentTypes';
import { FontSizeDropdown } from './Dropdown/FontSizeDropdown';
import { ButtonWrapper } from './ConfirmationAppBar';
import { useUpdatePageContents } from '../../hooks/mutations/UpdateCategoryPageContent';
import { getRouterName } from '../../utils/helpers';
import { useLocation, useMatch, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HistoryEditor } from 'slate-history';
import { useUpdateNoticePageContents } from '../../hooks/mutations/UpdateNoticePageContent';
import { useCreateNoticePageContent } from '../../hooks/mutations/CreateNoticePageContent';
import { UnsavedChangesIndicator } from './UnsavedChangesIndicator';

type MarkButtonProps = { editor: ReactEditor; format: FontFormatType; icon: ReactNode };

type BlockButtonProps = {
  editor: ReactEditor;
  format: ElementType;
  icon: ReactNode;
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
  const { editor, value, valueReset, noticeFields, selectedImage, hasUnsavedChanges, markSaved } =
    useContext(EditorContext);
  const [isColorOpened, setIsColorOpened] = useState(false);
  const { pathname } = useLocation();
  const categoryName = pathname.split('/').at(-1) || '';
  const noticeRoute = useMatch('/ajankohtaista/:id/:date');
  const { id: noticeId } = useParams();
  const noticeCreateRoute = useMatch('/ajankohtaista/uusi');

  let isCreateRoute = false;
  if (noticeRoute && noticeRoute.params.id === 'uusi') {
    isCreateRoute = true;
  }

  const mutatePageContents = useUpdatePageContents(getRouterName(categoryName));
  const mutateNoticePageContents = useUpdateNoticePageContents(noticeId!);
  const createNoticePageContent = useCreateNoticePageContent();

  const { error } = mutatePageContents;

  const handleInsertLink = () => {
    const url = prompt(t('common:edit.enter_url'));
    if (!url) return;
    insertLink(editor, url);
  };

  const toggleColorPicker = () => setIsColorOpened(!isColorOpened);

  const handleSave = () => {
    if (noticeRoute && !isCreateRoute) {
      mutateNoticePageContents.mutate(
        { value, noticeFields, selectedImage },
        {
          onSuccess: (_response, submitted) => {
            toast(t('common:edit.saved_success'), { type: 'success' });
            markSaved(submitted.value);
          },
          onError: () => {
            toast(error ? error.message : t('common:edit.saved_failure'), { type: 'error' });
          },
        },
      );
    } else if (noticeCreateRoute || isCreateRoute) {
      createNoticePageContent.mutate(
        { value, noticeFields, selectedImage },
        {
          onSuccess: (_response, submitted) => {
            toast(t('common:edit.saved_success'), { type: 'success' });
            markSaved(submitted.value);
          },
          onError: () => {
            toast(error ? error.message : t('common:edit.saved_failure'), { type: 'error' });
          },
        },
      );
    } else {
      mutatePageContents.mutate(
        { value, selectedImage },
        {
          onSuccess: (_response, submitted) => {
            toast(t('common:edit.saved_success'), { type: 'success' });
            markSaved(submitted.value);
          },
          onError: () => {
            toast(error ? error.message : t('common:edit.saved_failure'), { type: 'error' });
          },
        },
      );
    }
  };

  const handleClose = () => {
    if (!hasUnsavedChanges) {
      closeToolbarWithoutSaveHandler();
    } else {
      closeToolbarHandler();
    }
  };

  return (
    <ToolbarPaperWrapper elevation={2} aria-label={t('common:edit.toolbar')}>
      <SpacingWrapper justifyContent={'space-between'} width={'100%'}>
        <SpacingWrapper justifyContent={'space-around'} width={'auto'}>
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
            <LinkImageBox
              aria-label={t('common:edit.insert_link')}
              src={LinkIcon}
              alt="link"
              onClick={handleInsertLink}
            />
            {BlockButton({
              editor,
              format: ElementType.NUMBERED_LIST,
              icon: <FormatListNumberedIcon fontSize="small" />,
            })}
            {BlockButton({
              editor,
              format: ElementType.BULLET_LIST,
              icon: <FormatListBulletedIcon fontSize="small" />,
            })}
          </ToggleButtonGroupWrapper>
          <DividerWrapper orientation="vertical" variant="middle" flexItem />
          <PaletteImageBox
            aria-label={t('common:edit.color')}
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
        </SpacingWrapper>
        <SpacingWrapper justifyContent={'Space-between'} width={'auto'}>
          <RejectButton variant="contained" disabled={!hasUnsavedChanges} onClick={valueReset}>
            <DeleteIcon fontSize="small" />
            {t('common:action.reject')}
          </RejectButton>
          <SaveButton variant="contained" disabled={!hasUnsavedChanges} onClick={handleSave}>
            <SaveAltIcon fontSize="small" />
            {t('common:action.save')}
          </SaveButton>
          <DoneContainer>
            <DoneButton
              variant="contained"
              aria-label={t('common:action.close')}
              hasUnsavedChanges={hasUnsavedChanges}
              onClick={handleClose}
            >
              <CheckIcon fontSize="small" />
              {t('common:action.done')}
            </DoneButton>
            <UnsavedChangesIndicator />
          </DoneContainer>
        </SpacingWrapper>
      </SpacingWrapper>
    </ToolbarPaperWrapper>
  );
};

const ToolbarPaperWrapper = styled(Paper)({
  display: 'flex',
  borderRadius: 0,
  boxShadow: 'none',
  flexWrap: 'wrap',
  backgroundColor: Colors.aliceblue,
  borderBottom: `1px dashed ${Colors.darkblue}`,
  padding: '16px 15px',
});

const SpacingWrapper = styled('div')<{ justifyContent: string; width: string }>(({ justifyContent, width }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: justifyContent,
  gap: '8px',
  flexWrap: 'wrap',
  width: width,
}));

const disabledButtonStyle = {
  '&.Mui-disabled': { backgroundColor: Colors.midgrey, color: Colors.darkgrey },
};

const RejectButton = styled(ButtonWrapper)({
  height: '3em',
  backgroundColor: Colors.yellow,
  color: Colors.extrablack,
  '&:hover': { backgroundColor: Colors.yellow },
  ...disabledButtonStyle,
});

const SaveButton = styled(ButtonWrapper)({
  height: '3em',
  backgroundColor: Colors.darkblue,
  color: Colors.white,
  '&:hover': { backgroundColor: Colors.darkblue },
  ...disabledButtonStyle,
});

const DoneButton = styled(ButtonWrapper, {
  shouldForwardProp: (prop) => prop !== 'hasUnsavedChanges',
})<{ hasUnsavedChanges: boolean }>(({ hasUnsavedChanges }) => {
  const background = hasUnsavedChanges ? Colors.darkred : Colors.darkgreen;
  return {
    backgroundColor: background,
    color: Colors.white,
    '&:hover': { backgroundColor: background },
  };
});

const DoneContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  marginLeft: 'auto',
  gap: '4px',
});

const ToggleButtonGroupWrapper = styled(ToggleButtonGroup, {
  shouldForwardProp: (prop) => prop !== 'fullWidth',
})(() => ({
  '.MuiToggleButton-root': { border: 'none' },
}));

const DividerWrapper = styled(Divider)(({ theme }) => ({
  margin: '0 27px',
  [theme.breakpoints.down('desktop')]: {
    display: 'none',
  },
}));

const LinkImageBox = styled('img', {
  shouldForwardProp: (prop) => prop !== 'fullWidth',
})({
  cursor: 'pointer',
  width: '25px',
  padding: '7px',
});

const PaletteImageBox = styled('img', {
  shouldForwardProp: (prop) => prop !== 'fullWidth',
})({
  cursor: 'pointer',
  width: '25px',
});
