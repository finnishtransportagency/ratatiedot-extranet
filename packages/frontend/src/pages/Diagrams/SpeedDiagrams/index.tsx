import { PolylineFinlandMap } from '../../../components/Map/PolylineFinlandMap';
import { ProtectedContainerWrapper } from '../../../styles/common';
import { PageProps } from '../../../types/common';

export const SpeedDiagrams = ({ id }: PageProps) => {
  return (
    <ProtectedContainerWrapper>
      <PolylineFinlandMap categoryId={id} />
    </ProtectedContainerWrapper>
  );
};
