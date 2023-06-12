import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import { RequestInit } from 'node-fetch';
import multer from 'multer';

const upload = multer({ dest: 'tmp/' });

const postFileToAlfresco = async (options: RequestInit, nodeId: string): Promise<any | undefined> => {
  const alfrescoUrl = 'https://localhost:3002/';
  const alfrescoCoreAPIUrl = `${alfrescoUrl}/alfresco/versions/1`;
  const url = `${alfrescoCoreAPIUrl}/nodes/${nodeId}/children`;
  const res = await fetch(url, options);
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
const port = 3000;

const uploadFile = (req: Request, res: Response) => {
  console.log(req.body);
  console.log(req.file);
  res.json({ message: 'Successfully uploaded files' });
};

app.post('/file', upload.single('filedata'), uploadFile);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
