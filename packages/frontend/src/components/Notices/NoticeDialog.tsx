import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Divider,
  FormControlLabel,
  Checkbox,
  DialogActions,
  Button,
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fi } from 'date-fns/locale';
import NoticeEditor from '../../utils/NoticeEditor';
import { HighlightedTitle } from '../Typography/HighlightedTitle';
import { AxiosResponse } from 'axios';
import { useState } from 'react';
interface NoticeUploadProps {
  categoryName: string;
  nestedFolderId?: string;
  onClose: (event?: {}) => void;
  onUpload: (result: AxiosResponse) => any;
  open: boolean;
}
const NoticeDialog = ({ onUpload, onClose, open }: NoticeUploadProps) => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [value, setValue] = useState<any[]>([
    {
      type: 'title',
      children: [{ text: 'Otsikko' }],
    },
    {
      type: 'paragraph',
      children: [{ text: 'Tekstisisältö' }],
    },
  ]);
  const [isBanner, setIsBanner] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleNoticeUpload = () => {
    console.log('Uploading a file at handleNoticeUpload');
    console.log('Value: ', value);

    const mockResult = {
      status: 'OK',
      content: { fields: [...value] },
    };

    onUpload(mockResult);
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            width: '100%',
            height: '50vh',
            maxWidth: '1200px',
          },
        },
      }}
    >
      <DialogTitle>
        <HighlightedTitle>Lisää uusi ilmoitus</HighlightedTitle>
      </DialogTitle>
      <DialogContent>
        <NoticeEditor value={value} setValue={setValue} />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fi}>
          <List>
            <ListItem disableGutters>
              <DateTimePicker label="Aloituspäivä" value={startDate} onChange={(newValue) => setStartDate(newValue)} />
            </ListItem>
            <Divider />
            <ListItem disableGutters>
              <DateTimePicker label="Lopetuspäivä" value={endDate} onChange={(newValue) => setEndDate(newValue)} />
            </ListItem>
            <ListItem disableGutters>
              <FormControlLabel
                control={<Checkbox checked={isBanner} onChange={() => setIsBanner(!isBanner)} />}
                label="Näytä bannerina"
              />
            </ListItem>
          </List>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleNoticeUpload} color="primary">
          Tallenna
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoticeDialog;
