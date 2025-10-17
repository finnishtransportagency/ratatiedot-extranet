import { FunctionComponent } from 'react';
import { Chip, ChipProps, SxProps, Theme } from '@mui/material';
import { InsertDriveFile } from '@mui/icons-material';
import { Colors } from '../../constants/Colors';

interface Props {
  text: string;
  color?: ChipProps['color'];
  icon?: React.ReactElement;
  onClick?: () => void;
  onDelete?: () => void;
  sx?: SxProps<Theme>;
}

export const ChipWrapper: FunctionComponent<Props> = ({ text, color, icon, onClick, onDelete, sx }) => {
  return (
    <Chip
      label={text}
      color={color}
      icon={icon || <InsertDriveFile />}
      onClick={onClick}
      onDelete={onDelete}
      sx={{
        bgcolor: color ? undefined : Colors.lightgrey,
        color: color ? undefined : Colors.darkgrey,
        border: 1,
        borderColor: color ? undefined : Colors.midgrey,
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: 500,
        height: 'auto',
        py: 0.5,
        px: 1,
        '& .MuiChip-icon': {
          color: color ? undefined : Colors.darkgrey,
          fontSize: '18px',
          marginLeft: '4px',
        },
        '& .MuiChip-label': {
          px: 1,
        },
        '& .MuiChip-deleteIcon': {
          color: color ? undefined : Colors.darkgrey,
          fontSize: '18px',
          '&:hover': {
            color: Colors.darkred,
          },
        },
        '&:hover': {
          bgcolor: color ? undefined : Colors.midgrey,
        },
        ...sx,
      }}
    />
  );
};
