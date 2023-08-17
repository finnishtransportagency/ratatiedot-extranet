import { Button, ButtonProps, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { AxiosResponse } from 'axios';
import { t } from 'i18next';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { FunctionComponent, useState } from 'react';

import { FileUploadDialog } from './FileUploadDialog';
import { DriveFolderUploadOutlined } from '@mui/icons-material';
import { NewFolderDialog } from './NewFolderDialog';

interface DialogButtonProps {
  categoryName: string;
  nestedFolderId?: string;
  buttonProps?: ButtonProps;
  onUpload?: (response: AxiosResponse) => any;
}

export const UploadDialogButton: FunctionComponent<DialogButtonProps> = ({
  buttonProps,
  categoryName,
  nestedFolderId,
  onUpload,
}) => {
  const [openFileDialog, setOpenFileDialog] = useState(false);
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState(false);

  const handleOpenFileDialog = () => {
    setOpenFileDialog(true);
  };
  const handleCloseFileDialog = () => {
    setOpenFileDialog(false);
  };
  const handleOpenNewFolderDialog = () => {
    setOpenNewFolderDialog(true);
  };
  const handleCloseNewFolderDialog = () => {
    setOpenNewFolderDialog(false);
  };

  const handleUpload = (result: AxiosResponse) => {
    if (onUpload) onUpload(result);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="outlined" startIcon={<UploadFileIcon />} {...buttonProps} onClick={handleClick}>
        {t('common:action.add_new')}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleOpenNewFolderDialog}>
          <ListItemIcon>
            <DriveFolderUploadOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common:folder.add_folder')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenFileDialog}>
          <ListItemIcon>
            <UploadFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common:file.add_file')}</ListItemText>
        </MenuItem>
      </Menu>
      <FileUploadDialog
        onClose={handleCloseFileDialog}
        onUpload={handleUpload}
        open={openFileDialog}
        categoryName={categoryName}
        nestedFolderId={nestedFolderId}
      ></FileUploadDialog>
      <NewFolderDialog
        onClose={handleCloseNewFolderDialog}
        onUpload={handleUpload}
        open={openNewFolderDialog}
        categoryName={categoryName}
        nestedFolderId={nestedFolderId}
      ></NewFolderDialog>
    </>
  );
};
