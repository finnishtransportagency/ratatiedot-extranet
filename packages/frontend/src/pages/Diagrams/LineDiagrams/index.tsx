import { PolylineFinlandMap } from '../../../components/Map/PolylineFinlandMap';
import { PageTitleWrapper, ProtectedContainerWrapper } from '../../../styles/common';
import { getSubCategoryData } from '../../../utils/helpers';

const example = [
  {
    id: '0',
    from_lat: 60.1699, // Helsinki
    from_long: 24.9384,
    to_lat: 60.2052, // Espoo
    to_long: 24.6559,
    color: 'red',
  },
  {
    id: '1',
    from_lat: 60.1699, // Helsinki
    from_long: 24.9384,
    to_lat: 60.2934, // Vantaa
    to_long: 25.0379,
    color: 'blue',
  },
  {
    id: '2',
    from_lat: 60.2934, // Vantaa
    from_long: 25.0379,
    to_lat: 60.9827, // Lahti
    to_long: 25.6564,
    color: 'green',
    isDashed: true,
  },
];

export const LineDiagrams = () => {
  const categoryNames = getSubCategoryData();

  return (
    <ProtectedContainerWrapper>
      <PageTitleWrapper>{categoryNames.LINE_DIAGRAMS}</PageTitleWrapper>
      <PolylineFinlandMap coordinates={[65, 26]} zoom={5} />
    </ProtectedContainerWrapper>
  );
};
