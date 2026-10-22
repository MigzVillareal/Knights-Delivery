import { createOwnRequest, getOwnRequest, listOwnRequests } from '../services/request.service.js';
import { validateCreateRequest, validateRequestId, validateRequestListQuery } from '../validators/request.validator.js';

const validationError = (issue) => {
  const error = new Error('Request validation failed.');
  error.status = 422;
  error.code = 'VALIDATION_ERROR';
  error.details = [{ field: issue.field, issue: issue.message }];
  return error;
};

export const createRequest = async (req, res, next) => {
  const validation = validateCreateRequest(req.body);
  if (validation.error) return next(validationError(validation.error));
  try {
    const request = await createOwnRequest(req.supabaseApi, req.auth.userId, req.auth.accessToken, validation.value);
    return res.status(201).json({ data: request });
  } catch (error) {
    return next(error);
  }
};

export const listRequests = async (req, res, next) => {
  const validation = validateRequestListQuery(req.query);
  if (validation.error) return next(validationError(validation.error));
  try {
    const result = await listOwnRequests(req.supabaseApi, req.auth.userId, req.auth.accessToken, validation.value);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

export const getRequest = async (req, res, next) => {
  if (!validateRequestId(req.params.requestId)) {
    return next(validationError({ field: 'requestId', message: 'Must be a valid request ID.' }));
  }
  try {
    const request = await getOwnRequest(req.supabaseApi, req.auth.userId, req.auth.accessToken, req.params.requestId);
    return res.json({ data: request });
  } catch (error) {
    return next(error);
  }
};
