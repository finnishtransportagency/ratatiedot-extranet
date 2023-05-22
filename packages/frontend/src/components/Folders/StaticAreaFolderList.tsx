import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { StaticAreaFolder } from './StaticAreaFolder';

export const StaticAreaFolderList = () => {
  const { t } = useTranslation(['common']);
  return (
    <StaticAreaFolderListWrapper>
      <StaticAreaFolderTitleWrapper>{t('common:map.south')}</StaticAreaFolderTitleWrapper>
      <StaticAreaFolder color={Colors.darkblue} title={t('common:map.area') + ' 1 Uusimaa'} areaId={1} />
      <StaticAreaFolder color={Colors.lightgreen} title={t('common:map.area') + ' 2 Lounaisrannikko'} areaId={2} />

      <StaticAreaFolderTitleWrapper>{t('common:map.west')}</StaticAreaFolderTitleWrapper>
      <StaticAreaFolder color={Colors.pink} title={t('common:map.area') + ' 3 (Riihimäki)-Kokkola'} areaId={3} />
      <StaticAreaFolder color={Colors.purple} title={t('common:map.area') + ' 4 Rauma- (Pieksämäki)'} areaId={4} />
      <StaticAreaFolder color={Colors.midblue} title={t('common:map.area') + ' 5 Haapamäen tähti'} areaId={5} />

      <StaticAreaFolderTitleWrapper>{t('common:map.east')}</StaticAreaFolderTitleWrapper>
      <StaticAreaFolder color={Colors.lightred} title={t('common:map.area') + ' 6 Savon rata'} areaId={6} />
      <StaticAreaFolder
        color={Colors.darkblue}
        isDashed={true}
        title={t('common:map.area') + ' 7 Karjalan rata'}
        areaId={7}
      />
      <StaticAreaFolder
        color={Colors.lightgreen}
        isDashed={true}
        title={t('common:map.area') + ' 8 Yläsavo'}
        areaId={8}
      />

      <StaticAreaFolderTitleWrapper>{t('common:map.north')}</StaticAreaFolderTitleWrapper>
      <StaticAreaFolder
        color={Colors.pink}
        isDashed={true}
        title={t('common:map.area') + ' 9 Pohjanmaan rata'}
        areaId={9}
      />
      <StaticAreaFolder
        color={Colors.purple}
        isDashed={true}
        title={t('common:map.area') + ' 10 Keski-Suomi'}
        areaId={10}
      />
      <StaticAreaFolder
        color={Colors.midblue}
        isDashed={true}
        title={t('common:map.area') + ' 11 Kainuu-Oulu'}
        areaId={11}
      />
      <StaticAreaFolder
        color={Colors.lightred}
        isDashed={true}
        title={t('common:map.area') + ' 12 Oulu-Lappi'}
        areaId={12}
      />
    </StaticAreaFolderListWrapper>
  );
};

const StaticAreaFolderTitleWrapper = styled(Typography)(() => ({
  marginBottom: '16px',
  textTransform: 'uppercase',
}));

const StaticAreaFolderListWrapper = styled('div')(({ theme }) => ({
  [theme.breakpoints.only('mobile')]: {
    width: '90%',
  },
  [theme.breakpoints.only('tablet')]: {
    width: '95%',
  },
  [theme.breakpoints.only('desktop')]: {
    width: '48%',
  },
}));
