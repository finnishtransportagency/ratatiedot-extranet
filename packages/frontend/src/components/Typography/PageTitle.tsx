import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { parseRouterName } from '../../utils/helpers';
import { PageTitleWrapper as TitleWrapper, ProtectedContainerWrapper } from '../../styles/common';

interface Props {
  routerName: string;
}

export const PageTitle: FunctionComponent<Props> = (props) => {
  const { t } = useTranslation(['common']);
  return (
    <ProtectedContainerWrapper>
      <TitleWrapper>{parseRouterName(props.routerName) || t('common:page.frontpage')}</TitleWrapper>
    </ProtectedContainerWrapper>
  );
};
