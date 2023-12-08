import { useEffect, useState } from 'react';
import { getNotices } from '../../services/NoticeListService';
import { ButtonWrapper, ProtectedContainerWrapper } from '../../styles/common';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Pagination,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { Colors } from '../../constants/Colors';
import { DateFormat, URIFriendlyDateFormat } from '../../constants/Formats';
import { Notice } from '../../types/types';
import { ErrorMessage } from '../../components/Notification/ErrorMessage';
import { Routes } from '../../constants/Routes';
import { t } from 'i18next';
import { checkAdminRights } from '../../services/AdminRightService';
import { DeleteOutline } from '@mui/icons-material';
import { Modal } from '../../components/Modal/Modal';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { deleteNotice } from '../../services/NoticeDeleteService';

export const Notices = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [success, setSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [open, setIsOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice>();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await getNotices(page);
        const { notices, totalItems } = response.data;
        setNotices(notices);
        setTotalPages(Math.ceil(totalItems / 10));
      } catch (error: any) {
        setError(true);
        setErrorMessage(error);
      }
    };

    const checkForAdminRights = async () => {
      const { isAdmin } = await checkAdminRights();
      setIsUserAdmin(isAdmin);
    };

    checkForAdminRights();
    fetchNotices();
  }, [page]);

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  const handleDeleteNotice = async () => {
    await deleteNotice(selectedNotice?.id!)
      .then((result) => {
        setError(false);
        setSuccess(true);
        setIsOpen(false);

        setNotices((prevNotices) => {
          return prevNotices.filter((notice) => notice.id !== selectedNotice?.id);
        });
      })
      .catch((error) => {
        setSuccess(false);
        setError(true);
      });
  };

  if (error) return <ErrorMessage error={errorMessage} />;

  return (
    <>
      <ProtectedContainerWrapper>
        {isUserAdmin && (
          <Button variant="outlined" sx={{ mb: '16px' }} href={Routes.NEW_NOTICE}>
            {t('common:noticeList.createNewNotice')}
          </Button>
        )}
        <List>
          {notices.map((node) => {
            return (
              <ListItem
                key={node.id}
                secondaryAction={
                  isUserAdmin && (
                    <IconButton
                      edge="end"
                      onClick={() => {
                        setIsOpen(true);
                        setSelectedNotice(node);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  )
                }
                disablePadding
              >
                <ListItemButton
                  key={node.id}
                  href={`${Routes.NOTICES}/${node.id}/${format(new Date(node.createdTime), URIFriendlyDateFormat)}`}
                >
                  <ListItemText secondary={format(new Date(node.createdTime), DateFormat)} primary={node.title} />
                  {(() => {
                    switch (node.state) {
                      case 'scheduled':
                        return <Chip label="Julkaisematon" color="secondary" variant="outlined" size="small" />;
                      case 'archived':
                        return <Chip label="Vanhentunut" color="secondary" variant="outlined" size="small" />;
                      default:
                        return;
                    }
                  })()}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => handlePageChange(value)}
          sx={{ justifyContent: 'center', display: 'flex' }}
          showFirstButton
          showLastButton
        />
      </ProtectedContainerWrapper>
      <Modal
        open={open}
        handleClose={() => setIsOpen(false)}
        onSnackbarClose={() => {
          setError(false);
          setSuccess(false);
        }}
        title={t('common:noticeList.deleteNotice')}
        error={error}
        success={success}
        errorMessage={t('common:noticeList.deleteNoticeFailed')}
        successMessage={t('common:noticeList.deleteNoticeSuccess')}
        children={
          <Box>
            <Typography>{`${t('common:noticeList.confirmDeleteNotice')}`}</Typography>
            <Box sx={{ display: 'flex' }}>
              <ButtonWrapper
                sx={{ marginLeft: 'auto' }}
                color="primary"
                variant="text"
                onClick={() => setIsOpen(false)}
              >
                {t('common:action.cancel')}
              </ButtonWrapper>
              <ButtonWrapper
                color="error"
                variant="contained"
                disabled={false}
                onClick={() => handleDeleteNotice()}
                startIcon={
                  false ? (
                    <CircularProgress sx={{ color: Colors.darkgrey }} size="16px"></CircularProgress>
                  ) : (
                    <DeleteOutlineOutlinedIcon></DeleteOutlineOutlinedIcon>
                  )
                }
              >
                {t('common:action.delete')}
              </ButtonWrapper>
            </Box>
          </Box>
        }
      ></Modal>
    </>
  );
};
