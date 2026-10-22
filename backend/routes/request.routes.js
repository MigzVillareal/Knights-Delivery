import { Router } from 'express';
import { createRequest, getRequest, listRequests } from '../controllers/request.controller.js';
import { requireAuth } from '../middleware/require-auth.js';

export const createRequestRouter = ({ supabaseApi }) => {
  const router = Router();
  router.use('/requests', (req, _res, next) => {
    req.supabaseApi = supabaseApi;
    next();
  }, requireAuth(supabaseApi));
  router.get('/requests', listRequests);
  router.post('/requests', createRequest);
  router.get('/requests/:requestId', getRequest);
  return router;
};
