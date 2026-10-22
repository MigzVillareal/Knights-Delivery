import { advanceRunnerRequest, createOwnRequest, getOwnRequest, getRequestHistory, listOwnRequests, reportRequestIssue } from '../services/request.service.js';
import { validateCreateRequest, validateIssueReport, validateLifecycleAction, validateRequestId, validateRequestListQuery } from '../validators/request.validator.js';

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

const validateActionRequest = (req, next, validator) => {
  if (!validateRequestId(req.params.requestId)) return next(validationError({ field: 'requestId', message: 'Must be a valid request ID.' }));
  const result = validator(req.body);
  if (result.error) return next(validationError(result.error));
  return result.value;
};

export const postLifecycleAction = async (req, res, next) => {
  const value = validateActionRequest(req, next, validateLifecycleAction);
  if (!value) return;
  try {
    const request = await advanceRunnerRequest(req.supabaseApi, req.auth.userId, req.auth.accessToken, req.params.requestId, value.action);
    return res.json({ data: request });
  } catch (error) { return next(error); }
};

export const postIssue = async (req, res, next) => {
  const value = validateActionRequest(req, next, validateIssueReport);
  if (!value) return;
  try {
    const request = await reportRequestIssue(req.supabaseApi, req.auth.userId, req.auth.accessToken, req.params.requestId, value);
    return res.json({ data: request });
  } catch (error) { return next(error); }
};

export const getRequestEvents = async (req, res, next) => {
  if (!validateRequestId(req.params.requestId)) return next(validationError({ field: 'requestId', message: 'Must be a valid request ID.' }));
  try {
    const events = await getRequestHistory(req.supabaseApi, req.params.requestId, req.auth.accessToken);
    return res.json({ data: events });
  } catch (error) { return next(error); }
};
