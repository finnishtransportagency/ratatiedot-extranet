import { useParams } from 'react-router-dom';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getAreaByAlfrescoId } from '../../../utils/helpers';

export const AreaPage = () => {
  const { area } = useParams<{ area: string }>();

  let title;
  if (area) {
    title = getAreaByAlfrescoId(area)?.title || '';
  }

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{title}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
