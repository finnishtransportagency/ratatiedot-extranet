import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const PlanningArchive = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.PLANNING_ARCHIVE}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.PLANNING_ARCHIVE} />
    </ProtectedContainerWrapper>
  );
};
