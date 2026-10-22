const toCustomerEstimate = (row) => row.customer_estimate_minor === null || row.customer_estimate_minor === undefined
  ? null
  : {
      amountMinor: Number(row.customer_estimate_minor),
      currency: row.customer_estimate_currency
    };

const toRequest = (row) => ({
  id: row.id,
  status: row.status,
  category: row.category,
  itemDetails: row.item_details,
  pickup: {
    address: row.pickup_address,
    instructions: row.pickup_instructions
  },
  dropoff: {
    address: row.dropoff_address,
    instructions: row.dropoff_instructions
  },
  handoffNote: row.handoff_note,
  customerEstimate: toCustomerEstimate(row),
  quote: null,
  posting: row.status === 'awaiting_policy'
    ? { enabled: false, reason: 'POLICY_NOT_CONFIGURED' }
    : { enabled: true, reason: null },
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const toApplication = (row) => row ? ({ status: row.status, createdAt: row.created_at, updatedAt: row.updated_at }) : null;

const toEvent = (row) => ({
  id: row.id,
  eventType: row.event_type,
  fromStatus: row.from_status,
  toStatus: row.to_status,
  details: row.details,
  createdAt: row.created_at
});

const makeError = (status, code, message) => Object.assign(new Error(message), { status, code });

export const getRunnerApplication = async (supabaseApi, userId, token) =>
  toApplication(await supabaseApi.getRunnerApplication(userId, token));

export const submitRunnerApplication = async (supabaseApi, userId, token) => {
  const row = await supabaseApi.submitRunnerApplication(token);
  if (row.user_id !== userId) throw makeError(503, 'SUPABASE_RESPONSE_INVALID', 'Unexpected application owner.');
  return toApplication(row);
};

const requireEligibleRunner = async (supabaseApi, userId, token) => {
  const application = await supabaseApi.getRunnerApplication(userId, token);
  if (application?.user_id !== userId || application.status !== 'eligible') {
    throw makeError(403, 'RUNNER_NOT_ELIGIBLE', 'Runner eligibility is required.');
  }
};

export const listRunnerOpenRequests = async (supabaseApi, userId, token, { limit, cursor }) => {
  await requireEligibleRunner(supabaseApi, userId, token);
  const rows = await supabaseApi.listRunnerOpenRequests(token, { limit, cursor });
  return pageResult(rows, limit, (row) => ({
    id: row.id,
    category: row.category,
    itemSummary: row.item_summary,
    pickupArea: row.pickup_area,
    dropoffArea: row.dropoff_area,
    status: row.status,
    quote: row.quote,
    createdAt: row.created_at
  }));
};

export const listRunnerAssignedRequests = async (supabaseApi, userId, token, { limit, cursor }) => {
  await requireEligibleRunner(supabaseApi, userId, token);
  const rows = await supabaseApi.listRunnerAssignedRequests(token, { limit, cursor });
  if (rows.some((row) => row.assigned_runner_id !== userId)) {
    throw makeError(503, 'SUPABASE_RESPONSE_INVALID', 'Unexpected assigned request owner.');
  }
  return pageResult(rows, limit, toRequest);
};

export const acceptRunnerRequest = async (supabaseApi, userId, token, requestId) => {
  await requireEligibleRunner(supabaseApi, userId, token);
  const row = await supabaseApi.acceptRequest(token, requestId);
  if (row.assigned_runner_id !== userId || row.id !== requestId || row.status !== 'accepted') {
    throw makeError(503, 'SUPABASE_RESPONSE_INVALID', 'Unexpected acceptance response.');
  }
  return toRequest(row);
};

export const advanceRunnerRequest = async (supabaseApi, userId, token, requestId, action) => {
  await requireEligibleRunner(supabaseApi, userId, token);
  const row = await supabaseApi.advanceRequest(token, requestId, action);
  if (row.assigned_runner_id !== userId || row.id !== requestId) {
    throw makeError(503, 'SUPABASE_RESPONSE_INVALID', 'Unexpected lifecycle response.');
  }
  return toRequest(row);
};

export const reportRequestIssue = async (supabaseApi, userId, token, requestId, issue) => {
  const row = await supabaseApi.reportRequestIssue(token, requestId, issue.reason, issue.description);
  if (row.id !== requestId || (row.customer_id !== userId && row.assigned_runner_id !== userId)) {
    throw makeError(503, 'SUPABASE_RESPONSE_INVALID', 'Unexpected issue response.');
  }
  return toRequest(row);
};

export const getRequestHistory = async (supabaseApi, requestId, token) => {
  const rows = await supabaseApi.listRequestEvents(requestId, token);
  return rows.map(toEvent);
};

const encodeCursor = (row) => Buffer.from(JSON.stringify({
  id: row.id,
  createdAt: row.created_at
})).toString('base64url');

const pageResult = (rows, limit, toValue) => {
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  return {
    data: pageRows.map(toValue),
    page: { limit, nextCursor: hasMore && pageRows.length ? encodeCursor(pageRows[pageRows.length - 1]) : null }
  };
};

export const createOwnRequest = async (supabaseApi, userId, token, input) => {
  const estimate = input.customerEstimate;
  const row = await supabaseApi.createRequest(token, {
    p_category: input.category,
    p_item_details: input.itemDetails,
    p_pickup_address: input.pickup.address,
    p_pickup_instructions: input.pickup.instructions,
    p_dropoff_address: input.dropoff.address,
    p_dropoff_instructions: input.dropoff.instructions,
    p_handoff_note: input.handoffNote,
    p_customer_estimate_minor: estimate?.amountMinor ?? null,
    p_customer_estimate_currency: estimate?.currency ?? null
  });

  if (row.customer_id !== userId) {
    const error = new Error('Supabase returned a request with unexpected ownership.');
    error.status = 503;
    error.code = 'SUPABASE_RESPONSE_INVALID';
    throw error;
  }
  return toRequest(row);
};

export const listOwnRequests = async (supabaseApi, userId, token, { limit, cursor }) => {
  const rows = await supabaseApi.listRequests(userId, token, { limit, cursor });
  if (rows.some((row) => row.customer_id !== userId)) {
    const error = new Error('Supabase returned a request with unexpected ownership.');
    error.status = 503;
    error.code = 'SUPABASE_RESPONSE_INVALID';
    throw error;
  }
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  return {
    data: pageRows.map(toRequest),
    page: {
      limit,
      nextCursor: hasMore && pageRows.length ? encodeCursor(pageRows[pageRows.length - 1]) : null
    }
  };
};

export const getOwnRequest = async (supabaseApi, userId, token, requestId) => {
  const row = await supabaseApi.getRequest(userId, token, requestId);
  if (!row) {
    const error = new Error('Request not found.');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (row.customer_id !== userId) {
    const error = new Error('Request not found.');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  return toRequest(row);
};
