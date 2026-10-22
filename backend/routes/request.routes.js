import { Router } from 'express';
import { createRequest, getRequest, getRequestEvents, listRequests, postIssue, postLifecycleAction } from '../controllers/request.controller.js';
import { requireAuth } from '../middleware/require-auth.js';
import { acceptRequest } from '../controllers/runner.controller.js';

export const createRequestRouter = ({ supabaseApi }) => {
  const router = Router();
  router.use('/requests', (req, _res, next) => {
    req.supabaseApi = supabaseApi;
    next();
  }, requireAuth(supabaseApi));
  router.get('/requests', listRequests);
  router.post('/requests', createRequest);
  router.post('/requests/:requestId/accept', acceptRequest);
  router.post('/requests/:requestId/lifecycle', postLifecycleAction);
  router.post('/requests/:requestId/issues', postIssue);
  router.get('/requests/:requestId/events', getRequestEvents);
  router.get('/requests/:requestId', getRequest);
  return router;
};
