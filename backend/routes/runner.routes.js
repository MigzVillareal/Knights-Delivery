import { Router } from 'express';
import { getApplication, getAssignedRequests, getOpenRequests, postApplication } from '../controllers/runner.controller.js';
import { requireAuth } from '../middleware/require-auth.js';

export const createRunnerRouter = ({ supabaseApi }) => {
  const router = Router();
  router.use('/runner', (req, _res, next) => { req.supabaseApi = supabaseApi; next(); }, requireAuth(supabaseApi));
  router.post('/runner/application', postApplication);
  router.get('/runner/application', getApplication);
  router.get('/runner/requests', getOpenRequests);
  router.get('/runner/requests/assigned', getAssignedRequests);
  return router;
};
