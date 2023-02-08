import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const RailwayMonitoringService = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.RAILWAY_MONITORING_SERVICE}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
