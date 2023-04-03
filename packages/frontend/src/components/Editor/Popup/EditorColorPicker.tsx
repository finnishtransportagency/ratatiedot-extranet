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
};

export const ColorButton = ({ editor, format, color }: ColorButtonProps) => {
  return (
    <ToggleButton
      value={format}
      onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        toggleColor(editor, format, color);
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

export const EditorColorPicker = () => {
  const { t } = useTranslation(['common']);
  const { editor } = useContext(EditorContext);

  const colorPicker = paletteCollection.map((palette: string) =>
    ColorButton({
      editor,
      format: FontFormatType.COLOR,
      color: palette,
    }),
  );

  return (
    <PopupWrapper aria-label="color">
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
