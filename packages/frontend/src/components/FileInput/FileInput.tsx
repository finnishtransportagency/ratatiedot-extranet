import { TextField } from '@mui/material';

interface FileInputProps {
  passFileData?: any;
}

export const FileInput = ({ passFileData }: FileInputProps) => {
  return (
    <TextField
      sx={{
        boxSizing: 'border-box',
        width: '100%',
        padding: '10px 8px',
        borderRadius: '4px',
        fontFamily: 'Exo2-Regular',
        fontSize: '16px',
      }}
      defaultValue=""
      type="file"
      onChange={(event) => {
        passFileData(event);
      }}
    />
  );
};
