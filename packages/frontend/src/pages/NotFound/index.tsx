import { Box, ListItemText } from '@mui/material';

import RataExtLogo from '../../assets/images/Logo_long.png';
import { SubtitleWrapper, ParagraphWrapper } from '../AccessDenied/index.styles';
import { ListWrapper, ListItemWrapper } from './index.styles';
import { ContainerWrapper } from '../../styles/common';
import { ButtonWrapper as HomeButton } from '../../styles/common';
import { Routes } from '../../constants/Routes';
import { useTranslation } from 'react-i18next';

export const NotFound = () => {
  const { t } = useTranslation(['notFound', 'common']);

  return (
    <ContainerWrapper textAlign={'center'}>
      <Box component="img" src={RataExtLogo} alt="Logo" />
      <SubtitleWrapper variant="subtitle2">{t('notFound:title')}</SubtitleWrapper>
      <ParagraphWrapper variant="body1">{t('notFound:description_primary')}</ParagraphWrapper>
      <ListWrapper>
        <ListItemText primary={t('notFound:list.title')} />
        <ListItemWrapper sx={{ display: 'list-item' }}>
          <ListItemText primary={t('notFound:list.item_1')} />
        </ListItemWrapper>
        <ListItemWrapper sx={{ display: 'list-item' }}>
          <ListItemText primary={t('notFound:list.item_2')} />
        </ListItemWrapper>
        <ListItemWrapper sx={{ display: 'list-item' }}>
          <ListItemText primary={t('notFound:list.item_3')} />
        </ListItemWrapper>
      </ListWrapper>
      <HomeButton href={Routes.HOME} color="primary" variant="contained">
        {t('common:action.go_home')}
      </HomeButton>
    </ContainerWrapper>
  );
};
