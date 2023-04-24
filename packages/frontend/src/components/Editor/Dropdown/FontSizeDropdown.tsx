import styled from '@emotion/styled';
import { MenuItem, OutlinedInput, Select } from '@mui/material';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../../constants/Colors';
import { EditorContext } from '../../../contexts/EditorContext';
import { toggleBlock } from '../../../utils/slateEditorUtil';
import { ElementType } from '../../../utils/types';

export const FontSizeDropdown = () => {
  const { t } = useTranslation(['common']);

  const { editor } = useContext(EditorContext);
  const [fontSize, setFontSize] = useState<ElementType>(ElementType.PARAGRAPH_TWO);

  const fontSizeHandler = (format: ElementType) => {
    setFontSize(format);
    toggleBlock(editor, format);
  };

  return (
    <SelectWrapper
      aria-label={t('common:edit.choose_fontsize')}
      value={fontSize}
      onChange={(event) => {
        fontSizeHandler(event.target.value as ElementType);
      }}
      input={<OutlinedInput />}
      sx={{ width: '100%' }}
    >
      <MenuItem value={ElementType.PARAGRAPH_TWO} aria-label={t('common:element.paragraph-two')}>
        {t('common:element.paragraph-two')}
      </MenuItem>
      <MenuItem
        value={ElementType.PARAGRAPH_ONE}
        sx={{ fontSize: '18px' }}
        aria-label={t('common:element.paragraph-one')}
      >
        {t('common:element.paragraph-one')}
      </MenuItem>
      <MenuItem
        value={ElementType.HEADING_TWO}
        sx={{ fontFamily: 'Exo2-Bold', fontSize: '20px' }}
        aria-label={t('common:element.heading-two')}
      >
        {t('common:element.heading-two')}
      </MenuItem>
      <MenuItem
        value={ElementType.HEADING_ONE}
        sx={{ fontFamily: 'Exo2-Bold', fontSize: '23px' }}
        aria-label={t('common:element.heading-one')}
      >
        {t('common:element.heading-one')}
      </MenuItem>
    </SelectWrapper>
  );
};

const SelectWrapper = styled(Select)(({ theme }) => ({
  backgroundColor: Colors.white,
  alignSelf: 'center',
  height: '50px',
  [theme.breakpoints.only('desktop')]: {
    width: '200px',
  },
}));
