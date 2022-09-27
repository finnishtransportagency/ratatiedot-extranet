import { Request, Response } from 'express';
import { IDataPayload } from '../types/data.type';

export const getApp = (_: Request, res: Response) => {
  const data: IDataPayload = {
    data: 'Ratatiedot Extranet API',
  };
  res.json(data);
};
