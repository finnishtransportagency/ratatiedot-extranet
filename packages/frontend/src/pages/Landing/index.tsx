import { useTranslation } from 'react-i18next';

import { SubtitleWrapper, ParagraphWrapper } from './index.styles';
import { ProtectedContainerWrapper } from '../../styles/common';
import { Grid, Link } from '@mui/material';
import { ActivityList } from '../../components/ActivityStream/ActivityList';
import { NoticeList } from '../../components/Notices/NoticeList';
import { useError } from '../../contexts/ErrorContext';
import { ErrorMessage } from '../../components/Notification/ErrorMessage';
import { useEffect, useState } from 'react';
import { Spinner } from '../../components/Spinner';
import { getNotices } from '../../services/NoticeListService';
import { getActivities } from '../../services/ActivityListService';
import { Notice, Activity } from '../../types/types';

const withApiData = (NoticeList: any, ActivityList: any) => {
  return () => {
    const [data, setData] = useState<{ notices: Notice[]; activities: Activity[] } | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response1 = await getNotices();
          const response2 = await getActivities();

          setData({ notices: response1.data.notices, activities: response2.data.data });
        } catch (error: any) {
          setError(error);
        }
      };

      fetchData();
    }, []);

    if (error) {
      return <ErrorMessage error={error} />;
    }

    if (!data) {
      return <Spinner />;
    }

    return (
      <Grid container spacing={2}>
        <Grid item mobile={12} tablet={12} desktop={6}>
          <NoticeList notices={data.notices} />
        </Grid>
        <Grid item mobile={12} tablet={12} desktop={6}>
          <ActivityList modifiedFiles={data.activities} />
        </Grid>
      </Grid>
    );
  };
};

const ActivityAndNoticeLists = withApiData(NoticeList, ActivityList);

export const Landing = () => {
  const { t } = useTranslation(['common', 'landing']);
  const { error } = useError();

  return (
    <ProtectedContainerWrapper>
      <SubtitleWrapper variant="subtitle1">{t('landing:welcome.text')}</SubtitleWrapper>
      <ParagraphWrapper variant="body1">{t('landing:welcome.description_primary')}</ParagraphWrapper>
      <ParagraphWrapper variant="body1">{t('landing:welcome.description_secondary')}</ParagraphWrapper>
      <ParagraphWrapper variant="body1">
        {t('landing:welcome.contact')}
        <Link
          href="mailto:ratatieto@vayla.fi"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline', textDecoration: 'none' }}
        >
          ratatieto@vayla.fi
        </Link>
        .
      </ParagraphWrapper>
      {error && <ErrorMessage error={error} />}
      <ActivityAndNoticeLists />
    </ProtectedContainerWrapper>
  );
};
