const SENSITIVE_KEY = /(authorization|cookie|password|token|secret|address|phone|handoff|itemdetails|body)/i;

const sanitize = (value, key = '') => {
  if (SENSITIVE_KEY.test(key)) return '[REDACTED]';
  if (Array.isArray(value)) return value.map((item) => sanitize(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [
      childKey,
      sanitize(childValue, childKey)
    ]));
  }
  if (typeof value === 'string') return value.slice(0, 500);
  return value;
};

export const logEvent = (event, fields = {}, level = 'info') => {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitize(fields)
  };
  const output = JSON.stringify(record);
  if (level === 'error') console.error(output);
  else console.log(output);
};
