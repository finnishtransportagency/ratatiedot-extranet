import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const DriverActivity = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.REGIONAL_LIMITATIONS_DRIVER_ACTIVITY}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.REGIONAL_LIMITATIONS_DRIVER_ACTIVITY} />
    </ProtectedContainerWrapper>
  );
};
