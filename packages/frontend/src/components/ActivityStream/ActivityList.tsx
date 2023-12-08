import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { ActivityItem } from './ActivityItem';
import { useTranslation } from 'react-i18next';
import { Activity } from '../../types/types';

export const ActivityList = ({ modifiedFiles }: { modifiedFiles: Activity[] }) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardHeader title={<HighlightedTitle>{t('activityList.recentUpdates')}</HighlightedTitle>} />
      <CardContent>
        {!modifiedFiles?.length && <Typography>{t('activityList.noRecentUpdates')}</Typography>}
        {modifiedFiles?.map((node: any, index: number) => <ActivityItem key={index} row={index} node={node} />)}
      </CardContent>
    </Card>
  );
};
