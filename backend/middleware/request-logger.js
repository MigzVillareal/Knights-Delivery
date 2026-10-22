import { logEvent } from '../services/logger.js';

export const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => {
    logEvent('http.request', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt
    }, res.statusCode >= 500 ? 'error' : 'info');
  });
  next();
};
