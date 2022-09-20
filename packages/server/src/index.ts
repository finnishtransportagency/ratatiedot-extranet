import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { IDataPayload } from './types/data.type';

dotenv.config();
const { NODE_ENV, PORT, HOST, FRONTEND_BASE_URL } = process.env;

const app = express();

// Define CORS rule
const whitelist = [FRONTEND_BASE_URL];
app.use(
  cors({
    origin: (origin: string | undefined, callback) => {
      if ((origin && whitelist.indexOf(origin) !== -1) || typeof origin === 'undefined') {
        callback(null, true);
      } else {
        callback(new Error('Request is blocked due to unlisted resource in our whitelist (CORS)'));
      }
    },
  }),
);

app.get('/', (_, res) => {
  const data: IDataPayload = {
    data: 'Ratatiedot Extranet API',
  };
  res.json(data);
});

app.listen(PORT, () => console.log(`NODE_ENV=${NODE_ENV}\nServer is running at ${HOST}${PORT}`));
