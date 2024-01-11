import { Box } from '@mui/material';
import { useContext, useRef } from 'react';

import TextIcon from '../../assets/icons/Add_teksti.svg';
import CardIcon from '../../assets/icons/Add_kortti.svg';
import ImageIcon from '../../assets/icons/Add_kuva.svg';
import { ElementType } from '../../utils/types';
import { insertImage, insertParagraph, openContactCard } from '../../utils/slateEditorUtil';
import { useTranslation } from 'react-i18next';
import { EditorContext } from '../../contexts/EditorContext';
import { TypeContainerWrapper } from './NotificationTypes';
import { toast } from 'react-toastify';

export const ContentTypes = () => {
  const { editor, value, valueHandler, selectedImageHandler } = useContext(EditorContext);
  const { t } = useTranslation(['common']);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const imageHandler = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1000000) {
        toast(t('common:file.file_too_large'), { type: 'error' });
      } else {
        selectedImageHandler(file);
        insertImage(editor, ElementType.IMAGE, URL.createObjectURL(file));
        event.target.value = '';
      }
    }
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
        aria-label={t('common:element.image')}
        component="img"
        sx={{ cursor: 'pointer' }}
        src={ImageIcon}
        alt="image"
        onClick={imageHandler}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
    </TypeContainerWrapper>
  );
};
