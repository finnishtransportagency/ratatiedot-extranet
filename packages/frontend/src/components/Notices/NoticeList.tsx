import { Card, CardHeader, CardContent, Typography, Box, Button } from '@mui/material';
import { t } from 'i18next';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { Colors } from '../../constants/Colors';
import { useNavigate } from 'react-router-dom';
import { DateFormat, URIFriendlyDateFormat } from '../../constants/Formats';
import { format } from 'date-fns';
import { ArrowForward } from '@mui/icons-material';
import { Notice } from '../../types/types';
import { Routes } from '../../constants/Routes';

export const NoticeList = ({ notices }: { notices: Notice[] }) => {
  const navigate = useNavigate();
  return (
    <Card sx={{ minWidth: 275 }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <CardHeader title={<HighlightedTitle>{t('noticeList.topical')}</HighlightedTitle>} />
      </Box>
      <CardContent>
        {!notices.length && <Typography>{t('noticeList.noRecentNotices')}</Typography>}

        {notices?.slice(0, 5).map((node) => {
          return (
            <Box sx={{ cursor: 'pointer' }} key={node.id}>
              <Typography>{format(new Date(node.publishTimeStart), DateFormat)}</Typography>
              <Typography
                sx={{ color: Colors.darkblue, marginBottom: '12px', fontSize: '18px', fontFamily: 'Exo2-Bold' }}
                onClick={() =>
                  navigate(
                    `${Routes.NOTICES}/${node.id}/${format(new Date(node.publishTimeStart), URIFriendlyDateFormat)}`,
                    {
                      state: { noticeId: node.id },
                    },
                  )
                }
              >
                {node.title}
              </Typography>
            </Box>
          );
        })}
        <Button endIcon={<ArrowForward />} onClick={() => navigate(Routes.NOTICES)}>
          {t('common:noticeList.showMore')}
        </Button>
      </CardContent>
    </Card>
  );
};
