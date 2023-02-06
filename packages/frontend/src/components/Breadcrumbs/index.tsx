import { Breadcrumbs, Link, Stack, Typography } from '@mui/material';
import { useLocation, useMatches } from 'react-router-dom';
import { Colors } from '../../constants/Colors';

export const CustomBreadcrumbs = () => {
  const { pathname } = useLocation();
  const routerNames = pathname.split('/').slice(1);

  const breadcrumbs = routerNames.map((routerName: string, index: number) => {
    // if (index === 0) {
    //   return (
    //     <Typography key="0" color="text.primary">
    //       {routerName}
    //     </Typography>
    //   );
    // }
    return (
      <Link underline="hover" key={index} color={Colors.extrablack} href={pathname}>
        {routerName}
      </Link>
    );
  });
  return (
    <Stack spacing={2}>
      <Breadcrumbs separator=">" aria-label="breadcrumb">
        {breadcrumbs}
      </Breadcrumbs>
    </Stack>
  );
};
