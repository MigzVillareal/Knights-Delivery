import { Router } from 'express';
import { getProfile, patchProfile } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/require-auth.js';

export const createProfileRouter = ({ supabaseApi }) => {
  const router = Router();
  router.use('/profile', (req, _res, next) => {
    req.supabaseApi = supabaseApi;
    next();
  }, requireAuth(supabaseApi));
  router.get('/profile', getProfile);
  router.patch('/profile', patchProfile);
  return router;
};
