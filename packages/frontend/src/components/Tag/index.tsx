import { FunctionComponent } from 'react';
import { Chip, ChipProps } from '@mui/material';
import { Colors } from '../../constants/Colors';

interface Props {
  text: string;
  color?: ChipProps['color'];
  icon?: React.ReactElement;
  deleteIcon?: React.ReactElement;
  onDelete?: () => void;
}

export const Tag: FunctionComponent<Props> = ({ text, color, icon, deleteIcon, onDelete }) => {
  return (
    <Chip
      size="small"
      label={text}
      color={color}
      icon={icon}
      deleteIcon={deleteIcon}
      onDelete={onDelete}
      sx={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: color ? undefined : Colors.black,
        fontSize: '12px',
        borderRadius: '4px',
        backgroundColor: color ? undefined : Colors.white,
        height: 'inherit',
        '& .MuiChip-label': {
          display: 'block',
          whiteSpace: 'normal',
          padding: '2px 8px 2px 8px',
          cursor: 'default',
        },
        '& .MuiSvgIcon-root': {
          height: '9px',
          width: '9px',
          paddingLeft: '3px',
        },
      }}
    />
  );
};
