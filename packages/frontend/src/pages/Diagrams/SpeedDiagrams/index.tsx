import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const SpeedDiagrams = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.SPEED_DIAGRAMS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.SPEED_DIAGRAMS} />
    </ProtectedContainerWrapper>
  );
};
