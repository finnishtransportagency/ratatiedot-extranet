import axios from 'axios';
import multer from 'multer';
import express, { Request, Response } from 'express';

const upload = multer({ dest: 'tmp/' });

const postFileToAlfresco = async (options: RequestInit, nodeId: string): Promise<any | undefined> => {
  const alfrescoUrl = 'https://localhost:3002/';
  const alfrescoCoreAPIUrl = `${alfrescoUrl}/alfresco/versions/1`;
  const url = `${alfrescoCoreAPIUrl}/nodes/${nodeId}/children`;
  const res = await axios.post(url, options);
  return res;
};

const getRequestData = (request) => {
  const requestData = { user: 'LX123123' };
  return requestData;
};

function uploadFiles(req) {
  console.log(req);
}

const handleRequest = async (event: any): Promise<any> => {
  try {
    const paths = event.path.split('/');
    const category = paths.pop();

    const result = await postFileToAlfresco({}, 'foo-123');
    return {
      statusCode: 200,
      headers: { 'Content-Type:': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return err;
  }
};

const app = express();
const port = 8080;

const uploadFile = (req: Request, res: Response) => {
  console.log(req.body);
  console.log(req.file);
  res.json({ message: 'Successfully uploaded files' });
};

const test = () => {
  console.log('HELLO!!');
};

app.post('/api/alfresco/file/hallintaraportit', upload.single('filedata'), uploadFile);
app.get('/api/file/test', test);
app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
