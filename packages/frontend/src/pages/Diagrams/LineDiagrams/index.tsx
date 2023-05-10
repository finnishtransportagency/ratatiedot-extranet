import { PolylineFinlandMap } from '../../../components/Map/PolylineFinlandMap';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const LineDiagrams = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.LINE_DIAGRAMS}</PageTitleWrapper>
      <PolylineFinlandMap />
    </ProtectedContainerWrapper>
  );
};
