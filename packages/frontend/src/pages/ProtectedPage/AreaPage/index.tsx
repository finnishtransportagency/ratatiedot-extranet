import { useParams } from 'react-router-dom';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getReadableAreaTitle } from '../../../utils/mapUtil';

export const AreaPage = () => {
  const { area } = useParams<{ area: string }>();
  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{getReadableAreaTitle(area!)}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
