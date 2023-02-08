import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const RouteDocuments = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.ROUTE_DOCUMENTS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.ROUTE_DOCUMENTS} />
    </ProtectedContainerWrapper>
  );
};
