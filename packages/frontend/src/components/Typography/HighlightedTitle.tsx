import { FunctionComponent } from 'react';
import { Typography } from '@mui/material';
import { Colors } from '../../constants/Colors';

interface Props {
  children?: string;
}

export const HighlightedTitle: FunctionComponent<Props> = (props) => {
  return (
    <div>
      <Typography id="modal-modal-title" variant="subtitle1">
        {props.children}
      </Typography>
      <div style={{ width: '40px', height: '4px', backgroundColor: Colors.darkblue, marginBottom: '16px' }}></div>
    </div>
  );
};
