import dotenv from 'dotenv';
import { createApp } from './app.js';
import { loadConfig } from './config/env.js';
import { logEvent } from './services/logger.js';

dotenv.config();

const startServer = async () => {
  const config = loadConfig();
  const app = createApp(config);
  const server = app.listen(config.port, () => {
    logEvent('server.started', {
      environment: config.nodeEnv,
      port: config.port
    });
  });

  const shutdown = (signal) => {
    logEvent('server.stopping', { signal });
    server.close(() => process.exit(0));
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

startServer().catch((error) => {
  logEvent('server.start_failed', {
    message: error.message
  }, 'error');
  process.exitCode = 1;
});
