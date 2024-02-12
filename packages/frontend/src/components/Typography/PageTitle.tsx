import { FunctionComponent } from 'react';

import { parseRouterName } from '../../utils/helpers';
import { PageTitleWrapper as TitleWrapper, ProtectedContainerWrapper } from '../../styles/common';

interface Props {
  routerName: string;
}

export const PageTitle: FunctionComponent<Props> = (props) => {
  return (
    <ProtectedContainerWrapper>
      <TitleWrapper>{parseRouterName(props.routerName)}</TitleWrapper>
    </ProtectedContainerWrapper>
  );
};
