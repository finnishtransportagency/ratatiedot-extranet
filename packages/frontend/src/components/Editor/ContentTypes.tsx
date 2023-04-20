import { Box } from '@mui/material';
import { useContext } from 'react';

import TextIcon from '../../assets/icons/Add_teksti.svg';
import CardIcon from '../../assets/icons/Add_kortti.svg';
import FolderIcon from '../../assets/icons/Add_tiedosto.svg';
import { ElementType } from '../../utils/types';
import { openContactCard, openText } from '../../utils/slateEditorUtil';
import { useTranslation } from 'react-i18next';
import { EditorContext } from '../../contexts/EditorContext';
import { TypeContainerWrapper } from './NotificationTypes';

export const ContentTypes = () => {
  const { editor } = useContext(EditorContext);
  const { t } = useTranslation(['common']);

  const contactCardHandler = () => {
    openContactCard(editor, ElementType.CARD);
  };

  return (
    <TypeContainerWrapper>
      <Box
        aria-label={t('common:element.card')}
        component="img"
        sx={{ cursor: 'pointer' }}
        src={CardIcon}
        alt="card"
        onClick={() => {
          contactCardHandler();
        }}
      />
      <Box
        aria-label="teksti"
        component="img"
        sx={{ cursor: 'pointer' }}
        src={TextIcon}
        alt="text"
        onClick={() => openText(editor, ElementType.PARAGRAPH_TWO)}
      />
      <Box
        aria-label="tiedosto"
        component="img"
        sx={{ cursor: 'pointer' }}
        src={FolderIcon}
        alt="folder"
        onClick={() => console.log('// TODO: Add folder')}
      />
    </TypeContainerWrapper>
  );
};
