import styled from '@emotion/styled';
import MuiAppBar from '@mui/material/AppBar';
import { Box, Toolbar, Theme, CSSObject, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { createEditor, Descendant } from 'slate';
import { Slate, withReact } from 'slate-react';

import { Colors } from '../../constants/Colors';
import { Search } from '../Search';
import { drawerWidth } from '../../constants/Viewports';
import { DrawerWrapperProps } from './DesktopDrawer';
import { useContext, useState } from 'react';
import { AppBarContext } from '../../contexts/AppBarContext';
import { CustomBreadcrumbs } from '../Breadcrumbs';
import { useTranslation } from 'react-i18next';
import { ConfirmationAppBar } from '../Editor/ConfirmationAppBar';
import { SlateToolbar } from '../Editor/SlateToolbar';

const initialValue: Descendant[] = [
  {
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

export const DesktopAppBar = () => {
  const { openDrawer, openEdit, toggleEdit, openToolbar } = useContext(AppBarContext);
  const { t } = useTranslation(['common']);

  const [editor] = useState(() => withReact(createEditor()));

  const MainAppBar = () => {
    return (
      <>
        <CustomBreadcrumbs />
        <Box sx={{ flexGrow: 1 }} />
        {!openEdit && !openToolbar && (
          <EditButtonWrapper size="large" color="primary" variant="contained" onClick={toggleEdit}>
            <EditIcon fontSize="small" />
            {t('common:edit.edit_content')}
          </EditButtonWrapper>
        )}
        <ToolbarWrapper>
          <Search isDesktop={true} />
        </ToolbarWrapper>
      </>
    );
  };

  return (
    <DesktopAppBarWrapper color="transparent" open={openDrawer} openEdit={openEdit} openToolbar={openToolbar}>
      {/* Following components <ConfirmationAppBar /> and <SlateToolbar /> are visible across devices */}
      {openEdit && (
        <Toolbar>
          <ConfirmationAppBar />
        </Toolbar>
      )}
      {openToolbar && (
        <Slate editor={editor} value={initialValue}>
          <SlateToolbar />
        </Slate>
      )}
      <Toolbar>
        <MainAppBar />
      </Toolbar>
    </DesktopAppBarWrapper>
  );
};

const openedMixin = (theme: Theme): CSSObject => ({
  paddingLeft: `${drawerWidth}px`,
  transition: theme.transitions.create('padding', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

// Default closed drawer's width is 65px
const closedMixin = (theme: Theme): CSSObject => ({
  paddingLeft: '65px',
  transition: theme.transitions.create('padding', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
});

export const DesktopAppBarWrapper = styled(MuiAppBar)<DrawerWrapperProps>(({ theme, open, openEdit, openToolbar }) => {
  return {
    boxShadow: 'none',
    backgroundColor: Colors.white,
    // TODO: Title bar's left margin/padding is still incorrect
    [theme.breakpoints.only('mobile')]: {
      position: 'relative',
      marginTop: '70px',
    },
    [theme.breakpoints.only('tablet')]: {
      position: 'relative',
      marginTop: '70px',
      marginLeft: '20px',
    },
    [theme.breakpoints.up('desktop')]: {
      position: 'absolute',
      ...((open && {
        ...openedMixin(theme),
      }) as any),
      ...((!open && {
        ...closedMixin(theme),
      }) as any),
      overflow: 'visible',
      ...((openEdit || openToolbar) && {
        '.MuiToolbar-root:nth-of-type(2)': {
          padding: '24px 40px',
        },
      }),
      ...(!openEdit && {
        '.MuiToolbar-root:nth-of-type(1)': {
          padding: '24px 40px',
        },
      }),
    },
  };
});

const ToolbarWrapper = styled(Toolbar)(({ theme }) => ({
  [theme.breakpoints.down('desktop')]: {
    display: 'none',
  },
  [theme.breakpoints.up('desktop')]: {
    borderRadius: '4px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: Colors.extrablack,
  },
}));

const EditButtonWrapper = styled(Button)(({ theme }) => {
  return {
    padding: '9px 24px',
    borderRadius: '100px',
    marginRight: '24px',
    [theme.breakpoints.down('desktop')]: {
      display: 'none',
    },
  };
});
