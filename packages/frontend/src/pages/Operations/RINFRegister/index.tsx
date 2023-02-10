import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const RINFRegister = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.RINF_REGISTER}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.RINF_REGISTER} />
    </ProtectedContainerWrapper>
  );
};
