import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const BridgeInspections = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.BRIDGE_INSPECTIONS}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
