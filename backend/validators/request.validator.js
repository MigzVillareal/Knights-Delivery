const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ROOT_FIELDS = new Set(['category', 'itemDetails', 'pickup', 'dropoff', 'handoffNote', 'customerEstimate']);

const issue = (field, message) => ({ error: { field, message } });

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const requiredText = (value, field, maxLength) => {
  if (typeof value !== 'string') return issue(field, 'Must be text.');
  const normalized = value.trim();
  if (!normalized) return issue(field, 'Required.');
  if (normalized.length > maxLength) return issue(field, `Must be ${maxLength} characters or fewer.`);
  return { value: normalized };
};

const optionalText = (value, field, maxLength) => {
  if (value === undefined || value === null) return { value: null };
  if (typeof value !== 'string') return issue(field, 'Must be text or null.');
  const normalized = value.trim();
  if (normalized.length > maxLength) return issue(field, `Must be ${maxLength} characters or fewer.`);
  return { value: normalized || null };
};

const validateLocation = (value, field) => {
  if (!isObject(value)) return issue(field, 'Must be an object.');
  const unknown = Object.keys(value).find((key) => !['address', 'instructions'].includes(key));
  if (unknown) return issue(`${field}.${unknown}`, 'Field is not allowed.');
  const address = requiredText(value.address, `${field}.address`, 500);
  if (address.error) return address;
  const instructions = optionalText(value.instructions, `${field}.instructions`, 1000);
  if (instructions.error) return instructions;
  return { value: { address: address.value, instructions: instructions.value } };
};

export const validateCreateRequest = (body) => {
  if (!isObject(body)) return issue('body', 'Must be a JSON object.');
  const unknown = Object.keys(body).find((key) => !ROOT_FIELDS.has(key));
  if (unknown) return issue(unknown, 'Field is not allowed.');

  const category = requiredText(body.category, 'category', 40);
  if (category.error) return category;
  if (!/^[a-z][a-z0-9_-]*$/.test(category.value)) {
    return issue('category', 'Must be a lowercase category identifier.');
  }

  const itemDetails = requiredText(body.itemDetails, 'itemDetails', 2000);
  if (itemDetails.error) return itemDetails;
  const pickup = validateLocation(body.pickup, 'pickup');
  if (pickup.error) return pickup;
  const dropoff = validateLocation(body.dropoff, 'dropoff');
  if (dropoff.error) return dropoff;
  const handoffNote = optionalText(body.handoffNote, 'handoffNote', 1000);
  if (handoffNote.error) return handoffNote;

  let customerEstimate = null;
  if (body.customerEstimate !== undefined && body.customerEstimate !== null) {
    if (!isObject(body.customerEstimate)) return issue('customerEstimate', 'Must be an object or null.');
    const estimateUnknown = Object.keys(body.customerEstimate).find((key) => !['amountMinor', 'currency'].includes(key));
    if (estimateUnknown) return issue(`customerEstimate.${estimateUnknown}`, 'Field is not allowed.');
    const { amountMinor, currency } = body.customerEstimate;
    if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
      return issue('customerEstimate.amountMinor', 'Must be a non-negative integer in minor units.');
    }
    if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency)) {
      return issue('customerEstimate.currency', 'Must be a three-letter uppercase currency code.');
    }
    customerEstimate = { amountMinor, currency };
  }

  return {
    value: {
      category: category.value,
      itemDetails: itemDetails.value,
      pickup: pickup.value,
      dropoff: dropoff.value,
      handoffNote: handoffNote.value,
      customerEstimate
    }
  };
};

export const validateRequestId = (id) => UUID_PATTERN.test(id || '');

export const validateLifecycleAction = (body) => {
  if (!isObject(body)) return issue('body', 'Must be a JSON object.');
  const unknown = Object.keys(body).find((key) => key !== 'action');
  if (unknown) return issue(unknown, 'Field is not allowed.');
  if (!['start', 'mark_delivered'].includes(body.action)) {
    return issue('action', 'Must be start or mark_delivered.');
  }
  return { value: { action: body.action } };
};

export const validateIssueReport = (body) => {
  if (!isObject(body)) return issue('body', 'Must be a JSON object.');
  const unknown = Object.keys(body).find((key) => !['reason', 'description'].includes(key));
  if (unknown) return issue(unknown, 'Field is not allowed.');
  const reason = requiredText(body.reason, 'reason', 100);
  if (reason.error) return reason;
  const description = optionalText(body.description, 'description', 1000);
  if (description.error) return description;
  return { value: { reason: reason.value, description: description.value } };
};

export const validateRequestListQuery = (query) => {
  const limitValue = query.limit === undefined ? '20' : query.limit;
  if (typeof limitValue !== 'string' || !/^\d+$/.test(limitValue)) {
    return issue('limit', 'Must be a whole number from 1 to 100.');
  }
  const limit = Number(limitValue);
  if (limit < 1 || limit > 100) return issue('limit', 'Must be a whole number from 1 to 100.');

  let cursor = null;
  if (query.cursor !== undefined) {
    if (typeof query.cursor !== 'string' || query.cursor.length > 1024) {
      return issue('cursor', 'Must be a valid page cursor.');
    }
    try {
      const decoded = JSON.parse(Buffer.from(query.cursor, 'base64url').toString('utf8'));
      if (!isObject(decoded) || !validateRequestId(decoded.id)
        || typeof decoded.createdAt !== 'string' || !Number.isFinite(Date.parse(decoded.createdAt))) {
        return issue('cursor', 'Must be a valid page cursor.');
      }
      cursor = { id: decoded.id, createdAt: decoded.createdAt };
    } catch {
      return issue('cursor', 'Must be a valid page cursor.');
    }
  }
  return { value: { limit, cursor } };
};
