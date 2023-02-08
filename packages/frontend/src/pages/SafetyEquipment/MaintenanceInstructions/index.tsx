import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const MaintenanceInstructions = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.SAFETY_EQUIPMENT_MAINTENANCE_INSTRUCTIONS} />
    </ProtectedContainerWrapper>
  );
};
