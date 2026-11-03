import express from 'express';
import cors from 'cors';
import { createHealthRouter } from './routes/health.routes.js';
import { createProfileRouter } from './routes/profile.routes.js';
import { createRequestRouter } from './routes/request.routes.js';
import { createRunnerRouter } from './routes/runner.routes.js';
import { createSupabaseApi } from './services/supabase-api.js';
import { requestContext } from './middleware/request-context.js';
import { requestLogger } from './middleware/request-logger.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

export const createApp = (config, { supabaseApi = createSupabaseApi(config) } = {}) => {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestContext);
  app.use(requestLogger);
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id']
  }));
  app.use(express.json({ limit: config.jsonBodyLimit }));

  app.get('/', (_req, res) => {
    res.type('text/plain').send('API is running...');
  });

  app.use('/api/v1', createHealthRouter());
  app.use('/api/v1', createProfileRouter({ supabaseApi }));
  app.use('/api/v1', createRequestRouter({ supabaseApi }));
  app.use('/api/v1', createRunnerRouter({ supabaseApi }));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
