import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { Colors } from '../../constants/Colors';
import { NoticeDialogButton } from './NewNoticeButton';
import { AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';
import { ElementType } from '../../utils/types';

const NoticeList: React.FC = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([
    {
      type: ElementType.HEADING_TWO,
      children: [{ text: 'Otsikko' }],
    },
    {
      type: 'paragraph',
      children: [{ text: 'Tekstisisältö' }],
    },
  ]);

  const addNotices = (notice: any) => {
    console.log('add this notice to the local state');

    setNotices([...notices, ...notice.content.fields]);
  };

  return (
    <Card sx={{ minWidth: 275 }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <CardHeader title={<HighlightedTitle>{t('noticeList.topical')}</HighlightedTitle>} />
        <NoticeDialogButton
          onUpload={(response: AxiosResponse) => {
            console.log('Response we get at NoticeList: ', response);
            addNotices(response);
          }}
        />
      </Box>
      <CardContent>
        {notices.map((node, index) => {
          return (
            <Typography
              variant="body2"
              sx={{ color: Colors.darkblue }}
              onClick={() => navigate(`/ajankohtaista/${index}`)}
            >
              {node.type === 'title' && node.children[0].text}
            </Typography>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default NoticeList;
