import styled from '@emotion/styled';
import { useLocation } from 'react-router-dom';
import { Colors } from '../../constants/Colors';
import { matchAreaIdWithFolderName } from '../../utils/mapUtil';

type StaticAreaFolderProps = {
  areaId: number;
  title: string;
  color: string;
  isDashed?: boolean;
};

export const StaticAreaFolder = ({ color, isDashed, title, areaId }: StaticAreaFolderProps) => {
  const { pathname } = useLocation();

  return (
    <StaticAreaFolderWrapper
      style={{ borderLeft: `8px ${isDashed ? 'dashed' : 'solid'} ${color}` }}
      href={`${pathname}/${matchAreaIdWithFolderName(areaId)}`}
    >
      <StaticAreaFolderTitleWrapper>{title}</StaticAreaFolderTitleWrapper>
    </StaticAreaFolderWrapper>
  );
};

const StaticAreaFolderWrapper = styled('a')(() => ({
  display: 'flex',
  width: '100%',
  backgroundColor: Colors.lightgrey,
  borderRadius: '12px',
  height: '56px',
  marginBottom: '16px',
  textDecoration: 'none',
}));

const StaticAreaFolderTitleWrapper = styled('span')(() => ({
  alignSelf: 'center',
  paddingLeft: '16px',
  cursor: 'pointer',
  color: Colors.extrablack,
}));
