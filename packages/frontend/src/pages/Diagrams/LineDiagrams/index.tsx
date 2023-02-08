import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const LineDiagrams = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.LINE_DIAGRAMS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.LINE_DIAGRAMS} />
    </ProtectedContainerWrapper>
  );
};
