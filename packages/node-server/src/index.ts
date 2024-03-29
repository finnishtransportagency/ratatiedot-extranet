import multer from 'multer';
import express, { Request, Response } from 'express';
import { log } from './utils/logger.js';
import uploadFileHandler from './services/alfresco/upload-file.js';

const upload = multer().single('filedata');

const uploadFile = async (req: Request, res: Response) => {
  try {
    const result = await uploadFileHandler(req);
    res.send(result);
  } catch (err) {
    log.error(err);
    if (err.status) {
      res.sendStatus(err.status);
    } else {
      res.sendStatus(500);
    }
  }
};

const app = express();
const port = 8080;

app.disable('x-powered-by');

app.post('/api/alfresco/file/:category/:nestedFolderId?', upload, uploadFile);
app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
