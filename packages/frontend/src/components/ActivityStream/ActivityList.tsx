import { Card, CardContent, Typography } from '@mui/material';
import { AlfrescoActivityResponse, AlfrescoCombinedResponse, TNode } from '../../types/types';
import { ErrorMessage } from '../Notification/ErrorMessage';
import { Spinner } from '../Spinner';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { ActivityItem } from './ActivityItem';
import axios from 'axios';
import { useState, useEffect } from 'react';

export const ActivityList = () => {
  const [modifiedFiles, setModifiedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState();

  const getActivityList = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/alfresco/activities');
      const { data } = response.data;

      const sorted = data.sort((a: AlfrescoCombinedResponse, b: AlfrescoCombinedResponse) => {
        const dateA = new Date(a.activityEntry.postedAt);
        const dateB = new Date(b.activityEntry.postedAt);

        return dateB.getTime() - dateA.getTime();
      });

      setModifiedFiles(sorted);
      setIsLoading(false);
    } catch (error: any) {
      setError(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getActivityList();
  }, []);
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <HighlightedTitle>Viimeksi muokatut</HighlightedTitle>
        {error && <ErrorMessage error={error} />}
        {!modifiedFiles.length && !isLoading && !error && <Typography>Ei viimeaikaisia muutoksia</Typography>}
        {isLoading ? (
          <Spinner />
        ) : (
          modifiedFiles.map((node: AlfrescoCombinedResponse, index: number) => (
            <ActivityItem key={index} row={index} node={node} />
          ))
        )}
      </CardContent>
    </Card>
  );
};
