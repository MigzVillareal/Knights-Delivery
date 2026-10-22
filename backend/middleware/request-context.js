import { randomUUID } from 'node:crypto';

export const requestContext = (req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
};
