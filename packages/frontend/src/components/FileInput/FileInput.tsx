import { TextField } from '@mui/material';

interface FileInputProps {
  passFileData?: any;
}

export const FileInput = ({ passFileData }: FileInputProps) => {
  return (
    <TextField
      fullWidth
      defaultValue=""
      type="file"
      onChange={(event) => {
        passFileData(event);
      }}
    />
  );
};
