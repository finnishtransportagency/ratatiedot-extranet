import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const InterchangeContactInformation = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.INTERCHANGE_CONTACT_INFORMATION}</PageTitleWrapper>
    </ProtectedContainerWrapper>
  );
};
