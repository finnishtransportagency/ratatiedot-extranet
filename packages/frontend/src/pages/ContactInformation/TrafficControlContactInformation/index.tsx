import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const TrafficControl = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.GROUPING_DIAGRAMS}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
