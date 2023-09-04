import multer from 'multer';
import express, { Request, Response } from 'express';
import { log } from './utils/logger.js';
import uploadFileHandler from './services/alfresco/upload-file.js';
import { RataExtraEC2Error } from './utils/errors.js';

const upload = multer().single('filedata');

const uploadFile = async (req: Request, res: Response) => {
  try {
    const result = await uploadFileHandler(req);
    res.send(result);
  } catch (err) {
    log.error(err);
    if (err.status) {
      if (err.status === 409) {
        const rataExtraEC2Error = new RataExtraEC2Error('File already exists', 409, 'fileAlreadyExists');
        return res
          .status(rataExtraEC2Error.statusCode)
          .json({ errorTranslationKey: rataExtraEC2Error.errorTranslationKey });
      }
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
