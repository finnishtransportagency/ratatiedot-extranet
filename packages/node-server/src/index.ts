import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import { RequestInit } from 'node-fetch';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

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

/**
 * Upload custom content for page. Example request: /api/alfresco/file/linjakaaviot
 * @param {FileUploadRequest} event
 * @param {{string}} event.path Path should end with the page to upload the file to
 * @param {{string}} event.body File contents and metadata to upload
 * @returns  {Promise<ALBResult>} JSON stringified object of uploaded file metadata
 */
async function handleRequest(event: any): Promise<any> {
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
}

const app = express();
const port = 3000;

const uploadFile = (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.json({ message: 'Successfully uploaded files' });
};

app.post('/file', upload.single('filedata'), uploadFile);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
