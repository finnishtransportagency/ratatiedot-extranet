import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const RailwaySigns = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.RAILWAY_SIGNS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.RAILWAY_SIGNS} />
    </ProtectedContainerWrapper>
  );
};
