import { Box } from '@mui/material';
import { useContext } from 'react';

import TextIcon from '../../assets/icons/Add_teksti.svg';
import CardIcon from '../../assets/icons/Add_kortti.svg';
import FolderIcon from '../../assets/icons/Add_tiedosto.svg';
import { ElementType } from '../../utils/types';
import { insertParagraph, openContactCard } from '../../utils/slateEditorUtil';
import { useTranslation } from 'react-i18next';
import { EditorContext } from '../../contexts/EditorContext';
import { TypeContainerWrapper } from './NotificationTypes';

export const ContentTypes = () => {
  const { editor, value, valueHandler } = useContext(EditorContext);
  const { t } = useTranslation(['common']);

  const contactCardHandler = () => {
    const newValue = [{ type: ElementType.CARD, ...value }];
    valueHandler(newValue);
    openContactCard(editor, ElementType.CARD);
  };

  const paragraphHandler = () => {
    const newValue = [{ type: ElementType.PARAGRAPH_TWO, ...value }];
    valueHandler(newValue);
    insertParagraph(editor, ElementType.PARAGRAPH_TWO);
  };

  return (
    <TypeContainerWrapper>
      <Box
        aria-label={t('common:element.card')}
        component="img"
        sx={{ cursor: 'pointer' }}
        src={CardIcon}
        alt="card"
        onClick={contactCardHandler}
      />
      <Box
        aria-label={t('common:element.text')}
        component="img"
        sx={{ cursor: 'pointer' }}
        src={TextIcon}
        alt="text"
        onClick={paragraphHandler}
      />
      <Box
        aria-label={t('common:element.file')}
        component="img"
        sx={{ cursor: 'pointer' }}
        src={FolderIcon}
        alt="folder"
        onClick={() => console.log('// TODO: Add folder')}
      />
    </TypeContainerWrapper>
  );
};
