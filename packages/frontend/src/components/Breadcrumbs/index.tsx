import { Breadcrumbs, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { Colors } from '../../constants/Colors';
import { parseRouterName } from '../../utils/helpers';
import { getReadableAreaTitle } from '../../utils/mapUtil';

export const CustomBreadcrumbs = () => {
  const { t } = useTranslation(['common']);
  const { pathname } = useLocation();
  const routerNames = pathname.split('/').slice(1);
  const { area } = useParams<{ area: string }>();

  const BreadcrumbText = ({ routerName }: { routerName: string }) => {
    return (
      <Typography sx={{ color: Colors.extrablack }}>
        {routerName === area ? getReadableAreaTitle(area) : parseRouterName(routerName) || t('common:page.frontpage')}
      </Typography>
    );
  };
  let breadcrumbPath = '';
  const breadcrumbs = routerNames.map((routerName: string, index: number) => {
    breadcrumbPath += '/' + routerName;
    return index === 0 ? (
      <BreadcrumbText key={index} routerName={routerName} />
    ) : (
      <Link underline="hover" key={index} href={breadcrumbPath}>
        <BreadcrumbText routerName={routerName} />
      </Link>
    );
  });
  return (
    <Stack spacing={2}>
      <Breadcrumbs separator=">" aria-label={t('common:element.breadcrumb')}>
        {breadcrumbs}
      </Breadcrumbs>
    </Stack>
  );
};
