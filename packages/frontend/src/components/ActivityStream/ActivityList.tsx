import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { ErrorMessage } from '../Notification/ErrorMessage';
import { Spinner } from '../Spinner';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { ActivityItem } from './ActivityItem';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '../../contexts/ErrorContext';
import { Errors } from '../../constants/Errors';

export const ActivityList = () => {
  const [modifiedFiles, setModifiedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState();
  const { t } = useTranslation();
  const { setError } = useError();

  const getActivityList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/database/activities');
      const { data } = response.data;

      setModifiedFiles(data);
      setIsLoading(false);
    } catch (error: any) {
      if (error.message === Errors.ERR_NETWORK) {
        setError(error);
      }
      setErrorMessage(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getActivityList();
  }, []);

  if (errorMessage) {
    return <ErrorMessage error={errorMessage} />;
  }

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardHeader title={<HighlightedTitle>{t('activityList.recentUpdates')}</HighlightedTitle>} />
      <CardContent>
        {!modifiedFiles.length && !isLoading && <Typography>{t('activityList.noRecentUpdates')}</Typography>}
        {isLoading ? (
          <Spinner />
        ) : (
          modifiedFiles.map((node, index: number) => <ActivityItem key={index} row={index} node={node} />)
        )}
      </CardContent>
    </Card>
  );
};
