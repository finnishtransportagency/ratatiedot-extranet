import { PageTitleWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';
import { ProtectedContainerWrapper } from '../../../styles/common';
import { CategoryFiles } from '../../../components/Files/CategoryFiles';

export const GroupingDiagrams = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.GROUPING_DIAGRAMS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.GROUPING_DIAGRAMS} />
    </ProtectedContainerWrapper>
  );
};
