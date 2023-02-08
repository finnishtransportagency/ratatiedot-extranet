import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const InterchangeDecisions = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.INTERCHANGE_DECISIONS}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
