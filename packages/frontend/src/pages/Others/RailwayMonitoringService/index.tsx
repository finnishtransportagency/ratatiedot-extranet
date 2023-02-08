import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const RailwayMonitoringService = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.RAILWAY_MONITORING_SERVICE}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.RAILWAY_MONITORING_SERVICE} />
    </ProtectedContainerWrapper>
  );
};
