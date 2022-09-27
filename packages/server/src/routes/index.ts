import express from 'express';
import appRouter from './app';

export default (app: any) => {
  const router = express.Router();
  // Call and pass router to share same endpoint
  appRouter(router);

  app.use('/api', router);
};
