import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const VAKRailDepot = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.VAK_RAIL_DEPOT}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.VAK_RAIL_DEPOT} />
    </ProtectedContainerWrapper>
  );
};
