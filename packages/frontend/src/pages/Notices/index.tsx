import { useEffect, useState } from 'react';
import { getNotices } from '../../services/NoticeListService';
import { ProtectedContainerWrapper } from '../../styles/common';
import { Box, Button, List, ListItemButton, ListItemText, Pagination, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Colors } from '../../constants/Colors';
import { DateFormat, URIFriendlyDateFormat } from '../../constants/Formats';
import { useNavigate } from 'react-router-dom';
import { Notice } from '../../types/types';
import { ErrorMessage } from '../../components/Notification/ErrorMessage';
import { Routes } from '../../constants/Routes';
import { t } from 'i18next';
import { checkAdminRights } from '../../services/AdminRightService';
import { theme } from '../../styles/createTheme';

export const Notices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(0);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await getNotices(page);
        const { notices, totalItems } = response.data;
        setNotices(notices);
        setTotalPages(Math.ceil(totalItems / 10));
      } catch (error: any) {
        setError(error);
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

  if (error) return <ErrorMessage error={error} />;

  return (
    <ProtectedContainerWrapper>
      {isUserAdmin && (
        <Button variant="outlined" sx={{ mb: '16px' }} onClick={() => navigate(Routes.NEW_NOTICE)}>
          {t('common:noticeList.createNewNotice')}
        </Button>
      )}
      <List>
        {notices.map((node) => {
          return (
            <ListItemButton
              sx={{
                whiteSpace: 'normal',
                flexGrow: 'unset',
                '&.MuiListItemButton-root:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
              key={node.id}
              href={`${Routes.NOTICES}/${node.id}/${format(new Date(node.createdTime), URIFriendlyDateFormat)}`}
            >
              <ListItemText
                secondary={format(new Date(node.createdTime), DateFormat)}
                primary={node.content[0].children[0].text}
              />
            </ListItemButton>
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
  );
};
