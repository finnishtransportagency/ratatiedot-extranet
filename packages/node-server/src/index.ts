import multer from 'multer';
import express, { Request, Response } from 'express';
import { log } from './utils/logger.js';
import uploadFileHandler from './services/alfresco/upload-file.js';
import getPdfFileHandler from './services/alfresco/get-pdf-file.js';

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

const getPdfFile = async (req: Request, res: Response) => {
  try {
    const result = await getPdfFileHandler(req);

    // Log the size of the PDF data being sent
    console.log(`Sending PDF to client: size = ${result.pdfData.length} bytes`);

    // Set headers explicitly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', result.pdfData.length);
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');

    // Send the binary data
    res.status(200);
    res.end(result.pdfData);
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
app.get('/api/alfresco/pdf/:nodeId', getPdfFile);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
