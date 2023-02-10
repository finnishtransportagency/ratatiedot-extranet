import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const TrackDiagrams = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.TRACK_DIAGRAMS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.TRACK_DIAGRAMS} />
    </ProtectedContainerWrapper>
  );
};
