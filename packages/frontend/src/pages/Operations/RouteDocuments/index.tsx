import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const RouteDocuments = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.ROUTE_DOCUMENTS}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
