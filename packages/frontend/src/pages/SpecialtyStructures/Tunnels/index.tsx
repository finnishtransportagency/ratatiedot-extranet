import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const Tunnels = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.TUNNELS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.TUNNELS} />
    </ProtectedContainerWrapper>
  );
};
