import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const PlanningArchive = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.PLANNING_ARCHIVE}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
