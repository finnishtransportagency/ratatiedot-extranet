import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const MonitoringEquipment = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.MONITORING_EQUIPMENT}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.MONITORING_EQUIPMENT} />
    </ProtectedContainerWrapper>
  );
};
