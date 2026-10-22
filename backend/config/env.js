const DEFAULT_CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];
const ALLOWED_NODE_ENVS = new Set(['development', 'test', 'production']);

export class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export const loadConfig = (env = process.env) => {
  const port = env.PORT === undefined || env.PORT === '' ? 5000 : Number(env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigurationError('PORT must be an integer between 1 and 65535.');
  }

  const nodeEnv = env.NODE_ENV || 'development';
  if (!ALLOWED_NODE_ENVS.has(nodeEnv)) {
    throw new ConfigurationError('NODE_ENV must be development, test, or production.');
  }

  const rawOrigins = env.CORS_ORIGINS;
  const corsOrigins = rawOrigins === undefined
    ? DEFAULT_CORS_ORIGINS
    : rawOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);

  if (corsOrigins.includes('*')) {
    throw new ConfigurationError('CORS_ORIGINS must list explicit origins; wildcard is not allowed.');
  }
  for (const origin of corsOrigins) {
    try {
      const parsed = new URL(origin);
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) {
        throw new Error();
      }
    } catch {
      throw new ConfigurationError('Each CORS_ORIGINS entry must be an explicit HTTP or HTTPS origin.');
    }
  }

  const jsonBodyLimit = env.JSON_BODY_LIMIT || '100kb';
  if (!/^\d+(?:b|kb|mb)$/i.test(jsonBodyLimit)) {
    throw new ConfigurationError('JSON_BODY_LIMIT must use a size such as 100kb or 1mb.');
  }

  const supabaseUrl = env.SUPABASE_URL || '';
  const supabasePublishableKey = env.SUPABASE_PUBLISHABLE_KEY || '';
  if (Boolean(supabaseUrl) !== Boolean(supabasePublishableKey)) {
    throw new ConfigurationError('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be configured together.');
  }
  if (supabaseUrl) {
    try {
      const parsed = new URL(supabaseUrl);
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== supabaseUrl.replace(/\/$/, '')) {
        throw new Error();
      }
    } catch {
      throw new ConfigurationError('SUPABASE_URL must be a valid HTTP or HTTPS origin.');
    }
  }

  return Object.freeze({
    port,
    nodeEnv,
    corsOrigins,
    jsonBodyLimit,
    supabaseUrl: supabaseUrl.replace(/\/$/, ''),
    supabasePublishableKey
  });
};
