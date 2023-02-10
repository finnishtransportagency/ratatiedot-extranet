import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const BridgeInspections = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.BRIDGE_INSPECTIONS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.BRIDGE_INSPECTIONS} />
    </ProtectedContainerWrapper>
  );
};
