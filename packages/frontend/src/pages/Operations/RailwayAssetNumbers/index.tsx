import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const RailwayAssetNumbers = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.RAILWAY_ASSET_NUMBERS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.RAILWAY_ASSET_NUMBERS} />
    </ProtectedContainerWrapper>
  );
};
