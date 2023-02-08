import { PageTitleWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';
import { ProtectedContainerWrapper } from '../../../styles/common';

export const GroupingDiagrams = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.GROUPING_DIAGRAMS}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
