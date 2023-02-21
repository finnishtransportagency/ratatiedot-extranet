import { TextField } from '@mui/material';

interface FileInputProps {
  passFileData?: any;
}

export const FileInput = ({ passFileData }: FileInputProps) => {
  return (
    <TextField
      sx={{
        width: '100%',
      }}
      defaultValue=""
      type="file"
      onChange={(event) => {
        passFileData(event);
      }}
    />
  );
};
