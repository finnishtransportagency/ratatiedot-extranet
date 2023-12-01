import { Card, CardHeader, CardContent, Typography, Box, Button } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { Colors } from '../../constants/Colors';
import { NoticeDialogButton } from './NewNoticeButton';
import { useNavigate } from 'react-router-dom';
import { getNotices } from '../../services/NoticeListService';
import { DateFormat } from '../../constants/Formats';
import { format } from 'date-fns';
import { ArrowForward } from '@mui/icons-material';
import { Notice } from '../../types/types';
import { Spinner } from '../Spinner';
import { checkAdminRights } from '../../services/AdminRightService';
import { Routes } from '../../constants/Routes';

const NoticeList = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState();
  const [loading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkUserRights = async () => {
    const { isAdmin } = await checkAdminRights();
    setIsAdmin(isAdmin);
  };

  const listNotices = async () => {
    try {
      setIsLoading(true);
      const response = await getNotices();
      const { notices } = response.data;
      setNotices(notices);
      setIsLoading(false);
    } catch (error: any) {
      setError(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserRights();
    listNotices();
  }, []);

  if (error) return;

  return (
    <Card sx={{ minWidth: 275 }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <CardHeader title={<HighlightedTitle>{t('noticeList.topical')}</HighlightedTitle>} />
        {isAdmin && <NoticeDialogButton />}
      </Box>
      <CardContent>
        {!notices.length && !loading && <Typography>{t('noticeList.noRecentNotices')}</Typography>}

        {notices.slice(0, 5).map((node) => {
          return (
            <Box sx={{ cursor: 'pointer' }}>
              <Typography>{format(new Date(node.publishTimeStart), DateFormat)}</Typography>
              <Typography
                sx={{ color: Colors.darkblue, marginBottom: '12px', fontSize: '18px', fontFamily: 'Exo2-Bold' }}
                onClick={() =>
                  navigate(`${Routes.NOTICES}/${node.content[0].children[0].text}`, {
                    state: { noticeId: node.id },
                  })
                }
              >
                {node.content[0].children[0].text}
              </Typography>
            </Box>
          );
        })}
        {loading && <Spinner />}
        {notices.length > 0 && (
          <Button endIcon={<ArrowForward />} onClick={() => navigate(Routes.NOTICES)}>
            Lue lisää
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default NoticeList;
