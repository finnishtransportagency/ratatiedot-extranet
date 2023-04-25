import { styled, ToggleButton } from '@mui/material';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import CircleIcon from '@mui/icons-material/Circle';

import { Colors } from '../../../constants/Colors';
import { EditorContext } from '../../../contexts/EditorContext';

import { toggleColor } from '../../../utils/slateEditorUtil';
import { FontFormatType } from '../../../utils/types';
import { HighlightedTitle } from '../../Typography/HighlightedTitle';

type ColorButtonProps = {
  editor: any;
  format: FontFormatType;
  color: string;
  colorName: string;
  onClose: () => void;
};

export const ColorButton = ({ editor, format, color, colorName, onClose }: ColorButtonProps) => {
  return (
    <ToggleButton
      aria-label={colorName}
      value={format}
      onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        toggleColor(editor, format, color);
        onClose();
      }}
    >
      <CircleIcon fontSize="small" sx={{ color, border: '2px black solid', borderRadius: '50%' }} />
    </ToggleButton>
  );
};

const paletteCollection = [
  Colors.darkblue,
  Colors.midblue,
  Colors.lightblue,
  Colors.darkgreen,
  Colors.lightgreen,
  Colors.yellow,
  Colors.pink,
  Colors.purple,
  Colors.darkred,
  Colors.lightred,
  Colors.cyan,
  Colors.black,
  Colors.white,
  Colors.darkgrey,
];

type EditorColorPickerProps = {
  onClose: () => void;
};

export const EditorColorPicker = ({ onClose }: EditorColorPickerProps) => {
  const { t } = useTranslation(['common']);
  const { editor } = useContext(EditorContext);
  const translatedColors = t(`common:colors`, { returnObjects: true });

  const colorPicker = paletteCollection.map((palette: string) => {
    const colorKey = Object.keys(Colors).find(
      (key) => Colors[key as keyof typeof Colors] === palette,
    ) as keyof typeof translatedColors;

    return ColorButton({
      editor,
      format: FontFormatType.COLOR,
      color: palette,
      colorName: translatedColors[colorKey],
      onClose: onClose,
    });
  });

  return (
    <PopupWrapper aria-label={t('common:edit.color_picker')}>
      <HighlightedTitle>{t('common:edit.choose_color')}</HighlightedTitle>
      {colorPicker}
    </PopupWrapper>
  );
};

const PopupWrapper = styled('div')(({ theme }) => ({
  width: '80%',
  position: 'absolute',
  zIndex: 1000,
  left: 20,
  top: '100px',
  backgroundColor: 'white',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid lightgray',
  [theme.breakpoints.up('tablet')]: {
    width: '345px',
    left: '40%',
  },
}));
