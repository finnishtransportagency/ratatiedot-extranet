import { Breadcrumbs, Link, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Colors } from '../../constants/Colors';
import { parseRouterName } from '../../utils/helpers';

export const CustomBreadcrumbs = () => {
  const { t } = useTranslation(['common']);
  const { pathname } = useLocation();
  const routerNames = pathname.split('/').slice(1);

  const BreadcrumbText = ({ routerName }: { routerName: string }) => {
    return (
      <Typography sx={{ color: Colors.extrablack }}>
        {parseRouterName(routerName) || t('common:page.frontpage')}
      </Typography>
    );
  };

  const breadcrumbs = routerNames.map((routerName: string, index: number) => {
    return index === 0 ? (
      <BreadcrumbText key={index} routerName={routerName} />
    ) : (
      <Link underline="hover" key={index} href={pathname}>
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
