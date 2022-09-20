import express from 'express';
import { IDataPayload } from './types/data.type';

const app = express();
const PORT = 8000;

app.get('/', (_, res) => {
  // TODO: whitelisting API addresses
  res.setHeader('Access-Control-Allow-Origin', '*');
  const data: IDataPayload = {
    data: 'Ratatiedot Extranet API',
  };
  res.json(data);
});

app.listen(PORT, () => console.log(`Server is running at port ${PORT}`));
