import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const ManagementReports = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.MANAGEMENT_REPORTS}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
