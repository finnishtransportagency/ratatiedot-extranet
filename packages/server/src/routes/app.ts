import { Router } from 'express';

import { getApp } from '../controllers/app';

export default (router: Router) => {
  router.get('/', getApp);
};
