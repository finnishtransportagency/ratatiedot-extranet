import { CategoryFiles } from '../../../components/Files/CategoryFiles';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

export const RailwayTunnelRescuePlans = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.RAILWAY_TUNNEL_RESCUE_PLANS}</PageTitleWrapper>
      <CategoryFiles categoryName={categoryNames.RAILWAY_TUNNEL_RESCUE_PLANS} />
    </ProtectedContainerWrapper>
  );
};
