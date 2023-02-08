import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const RailwayInterchangeDevelopmentNeeds = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.RAILWAY_INTERCHANGE_DEVELOPMENT_NEEDS} />
    </ProtectedContainerWrapper>
  );
};
