import { Router } from 'express';
import { getAssignedRequests, getOpenRequests } from '../controllers/runner.controller.js';
import { requireAuth } from '../middleware/require-auth.js';

export const createRunnerRouter = ({ supabaseApi }) => {
  const router = Router();
  router.use('/runner', (req, _res, next) => { req.supabaseApi = supabaseApi; next(); }, requireAuth(supabaseApi));
  router.get('/runner/requests', getOpenRequests);
  router.get('/runner/requests/assigned', getAssignedRequests);
  return router;
};
