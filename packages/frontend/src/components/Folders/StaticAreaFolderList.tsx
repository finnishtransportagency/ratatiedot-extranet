import styled from '@emotion/styled';
import { Typography } from '@mui/material';
import { Colors } from '../../constants/Colors';
import { StaticAreaFolder } from './StaticAreaFolder';

export const StaticAreaFolderList = () => {
  return (
    <StaticAreaFolderListWrapper>
      <StaticAreaFolderTitleWrapper>ETELÄ</StaticAreaFolderTitleWrapper>
      <StaticAreaFolder color={Colors.darkblue} title="Alue 1 Uusimaa" areaId={1} />
      <StaticAreaFolder color={Colors.lightgreen} title="Alue 2 Lounaisrannikko" areaId={2} />

      <StaticAreaFolderTitleWrapper>LÄNSI</StaticAreaFolderTitleWrapper>
      <StaticAreaFolder color={Colors.pink} title="Alue 3 (Riihimäki)-Kokkola" areaId={3} />
      <StaticAreaFolder color={Colors.purple} title="Alue 4 Rauma- (Pieksämäki)" areaId={4} />
      <StaticAreaFolder color={Colors.midblue} title="Alue 5 Haapamäen tähti" areaId={5} />

      <StaticAreaFolderTitleWrapper>ITÄ</StaticAreaFolderTitleWrapper>
      <StaticAreaFolder color={Colors.lightred} title="Alue 6 Savon rata" areaId={6} />
      <StaticAreaFolder color={Colors.darkblue} isDashed={true} title="Alue 7 Karjalan rata" areaId={7} />
      <StaticAreaFolder color={Colors.lightgreen} isDashed={true} title="Alue 8 Yläsavo" areaId={8} />

      <StaticAreaFolderTitleWrapper>POHJOINEN</StaticAreaFolderTitleWrapper>
      <StaticAreaFolder color={Colors.pink} isDashed={true} title="Alue 9 Pohjanmaan rata" areaId={9} />
      <StaticAreaFolder color={Colors.purple} isDashed={true} title="Alue 10 Keski-Suomi" areaId={10} />
      <StaticAreaFolder color={Colors.midblue} isDashed={true} title="Alue 11 Kainuu-Oulu" areaId={11} />
      <StaticAreaFolder color={Colors.lightred} isDashed={true} title="Alue 12 Oulu-Lappi" areaId={12} />
    </StaticAreaFolderListWrapper>
  );
};

const StaticAreaFolderTitleWrapper = styled(Typography)(() => ({
  marginBottom: '16px',
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
