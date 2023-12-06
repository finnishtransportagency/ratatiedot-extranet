import { Card, CardHeader, CardContent, Typography, Box, Button } from '@mui/material';
import { t } from 'i18next';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { Colors } from '../../constants/Colors';
import { useNavigate } from 'react-router-dom';
import { DateFormat } from '../../constants/Formats';
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
                  navigate(`${Routes.NOTICES}/${format(new Date(node.publishTimeStart), DateFormat)}`, {
                    state: { noticeId: node.id },
                  })
                }
              >
                {node.content[0].children[0].text}
              </Typography>
            </Box>
          );
        })}
        {notices.length > 0 && (
          <Button endIcon={<ArrowForward />} onClick={() => navigate(Routes.NOTICES)}>
            Lue lisää
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
