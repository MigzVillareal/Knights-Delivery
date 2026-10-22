const ALLOWED_FIELDS = new Set(['displayName', 'phone']);

export const validateProfileUpdate = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' };
  }

  const keys = Object.keys(body);
  if (keys.length === 0) return { error: 'At least one profile field is required.' };
  const unexpected = keys.find((key) => !ALLOWED_FIELDS.has(key));
  if (unexpected) return { error: `Field "${unexpected}" cannot be updated.` };

  const update = {};
  if ('displayName' in body) {
    if (body.displayName !== null && (typeof body.displayName !== 'string' || body.displayName.length > 120)) {
      return { error: 'displayName must be a string up to 120 characters or null.' };
    }
    update.display_name = body.displayName?.trim() || null;
  }
  if ('phone' in body) {
    if (body.phone !== null && (typeof body.phone !== 'string' || body.phone.length > 32)) {
      return { error: 'phone must be a string up to 32 characters or null.' };
    }
    update.phone = body.phone?.trim() || null;
  }
  return { value: update };
};
