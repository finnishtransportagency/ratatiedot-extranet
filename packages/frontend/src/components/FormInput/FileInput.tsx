import { TextField } from '@mui/material';

interface FileInputProps {
  passChildData?: any;
}

export const FileInput = ({ passChildData }: FileInputProps) => {
  return (
    <div>
      <TextField
        fullWidth
        id="outlined-required"
        defaultValue=""
        type="file"
        onChange={(event) => {
          passChildData(event);
        }}
      />
    </div>
  );
};
