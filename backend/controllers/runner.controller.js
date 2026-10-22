import {
  acceptRunnerRequest,
  getRunnerApplication,
  listRunnerAssignedRequests,
  listRunnerOpenRequests,
  submitRunnerApplication
} from '../services/request.service.js';
import { validateRequestId, validateRequestListQuery } from '../validators/request.validator.js';

const validationError = (issue) => Object.assign(new Error('Request validation failed.'), {
  status: 422,
  code: 'VALIDATION_ERROR',
  details: [{ field: issue.field, issue: issue.message }]
});

export const getApplication = async (req, res, next) => {
  try {
    return res.json({ data: await getRunnerApplication(req.supabaseApi, req.auth.userId, req.auth.accessToken) });
  } catch (error) { return next(error); }
};

export const postApplication = async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length) {
    const error = Object.assign(new Error('Application takes an empty object.'), { status: 422, code: 'VALIDATION_ERROR', details: [{ field: 'body', issue: 'Must be an empty JSON object.' }] });
    return next(error);
  }
  try {
    return res.status(201).json({ data: await submitRunnerApplication(req.supabaseApi, req.auth.userId, req.auth.accessToken) });
  } catch (error) { return next(error); }
};

export const getOpenRequests = async (req, res, next) => {
  const validation = validateRequestListQuery(req.query);
  if (validation.error) return next(validationError(validation.error));
  try {
    return res.json(await listRunnerOpenRequests(req.supabaseApi, req.auth.userId, req.auth.accessToken, validation.value));
  } catch (error) { return next(error); }
};

export const getAssignedRequests = async (req, res, next) => {
  const validation = validateRequestListQuery(req.query);
  if (validation.error) return next(validationError(validation.error));
  try {
    return res.json(await listRunnerAssignedRequests(req.supabaseApi, req.auth.userId, req.auth.accessToken, validation.value));
  } catch (error) { return next(error); }
};

export const acceptRequest = async (req, res, next) => {
  if (!validateRequestId(req.params.requestId)) {
    const error = Object.assign(new Error('Invalid request ID.'), { status: 422, code: 'VALIDATION_ERROR', details: [{ field: 'requestId', issue: 'Must be a valid request ID.' }] });
    return next(error);
  }
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length) {
    const error = Object.assign(new Error('Acceptance takes an empty object.'), { status: 422, code: 'VALIDATION_ERROR', details: [{ field: 'body', issue: 'Must be an empty JSON object.' }] });
    return next(error);
  }
  try {
    return res.json({ data: await acceptRunnerRequest(req.supabaseApi, req.auth.userId, req.auth.accessToken, req.params.requestId) });
  } catch (error) { return next(error); }
};
