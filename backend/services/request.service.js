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

const encodeCursor = (row) => Buffer.from(JSON.stringify({
  id: row.id,
  createdAt: row.created_at
})).toString('base64url');

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
