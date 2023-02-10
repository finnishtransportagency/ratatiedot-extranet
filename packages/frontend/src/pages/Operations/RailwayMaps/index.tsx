import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const RailwayMaps = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.RAILWAY_MAPS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.RAILWAY_MAPS} />
    </ProtectedContainerWrapper>
  );
};
