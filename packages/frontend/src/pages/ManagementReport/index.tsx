import { Button, FormControl, TextField } from '@mui/material';
import { useState } from 'react';
import { ContainerWrapper } from './index.styles';
import FileUploadService from '../../services/FileUploadService';

const Form = () => {
  const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    const selectedFiles = files as FileList;
    setFile(selectedFiles?.[0]);
  };
  const upload = () => {
    if (!file) return;

    FileUploadService.upload(nodeId, file).catch((err) => {
      if (err.response && err.response.data && err.response.data.message) {
      } else {
        console.log('something went wrong!');
      }

      setFile(undefined);
    });
  };
  const [file, setFile] = useState<File>();
  const [nodeId, setNodeId] = useState<string>('');
  return (
    <>
      <TextField type="file" onChange={selectFile} />
      <TextField
        value={nodeId}
        onChange={(event) => {
          setNodeId(event.target.value);
        }}
      />
      <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={upload}>
        Upload
      </Button>
    </>
  );
};

export const ManagementReport = () => {
  return (
    <ContainerWrapper>
      <Form />
    </ContainerWrapper>
  );
};
