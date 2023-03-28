import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const BridgeMaintenanceInstructions = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.BRIDGE_MAINTENANCE_INSTRUCTIONS}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
