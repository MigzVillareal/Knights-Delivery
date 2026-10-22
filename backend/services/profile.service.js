const toProfile = (row, userId) => ({
  id: row?.id || userId,
  displayName: row?.display_name ?? null,
  phone: row?.phone ?? null,
  createdAt: row?.created_at ?? null,
  updatedAt: row?.updated_at ?? null
});

export const getOwnProfile = async (supabaseApi, userId, token) => {
  const row = await supabaseApi.getProfile(userId, token);
  return toProfile(row, userId);
};

export const updateOwnProfile = async (supabaseApi, userId, token, update) => {
  const row = await supabaseApi.saveProfile(userId, token, update);
  return toProfile(row, userId);
};
