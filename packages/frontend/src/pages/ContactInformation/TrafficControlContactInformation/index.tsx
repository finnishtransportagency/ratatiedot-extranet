import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const TrafficControl = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.TRAFFIC_CONTROL_CONTACT_INFORMATION}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
