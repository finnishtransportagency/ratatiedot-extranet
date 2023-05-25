import { useParams } from 'react-router-dom';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';

export const AreaPage = () => {
  const { area } = useParams<{ area: string }>();
  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{area}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
