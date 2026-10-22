import { logEvent } from '../services/logger.js';

export const errorHandler = (error, req, res, _next) => {
  if (res.headersSent) return;

  const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 600
    ? error.status
    : error.type === 'entity.too.large' ? 413
      : error.type === 'entity.parse.failed' ? 400
        : 500;
  const code = error.code || (status === 413 ? 'PAYLOAD_TOO_LARGE'
    : status === 400 ? 'MALFORMED_JSON'
      : 'INTERNAL_ERROR');
  const message = status >= 500
    ? 'An unexpected server error occurred.'
    : status === 404 ? 'The requested resource was not found.'
      : status === 413 ? 'Request body exceeds the configured limit.'
        : 'Request could not be processed.';

  logEvent('http.error', {
    requestId: req.requestId,
    statusCode: status,
    code
  }, status >= 500 ? 'error' : 'info');

  res.status(status).json({
    error: {
      code,
      message,
      requestId: req.requestId
    }
  });
};
