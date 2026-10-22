import { getOwnProfile, updateOwnProfile } from '../services/profile.service.js';
import { validateProfileUpdate } from '../validators/profile.validator.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await getOwnProfile(req.supabaseApi, req.auth.userId, req.auth.accessToken);
    return res.json({ data: profile });
  } catch (error) {
    return next(error);
  }
};

export const patchProfile = async (req, res, next) => {
  const validation = validateProfileUpdate(req.body);
  if (validation.error) {
    const error = new Error(validation.error);
    error.status = 422;
    error.code = 'VALIDATION_ERROR';
    return next(error);
  }

  try {
    const profile = await updateOwnProfile(
      req.supabaseApi,
      req.auth.userId,
      req.auth.accessToken,
      validation.value
    );
    return res.json({ data: profile });
  } catch (error) {
    return next(error);
  }
};
