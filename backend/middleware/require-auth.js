export const requireAuth = (supabaseApi) => async (req, _res, next) => {
  const header = req.get('authorization') || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(header);
  if (!match) {
    const error = new Error('Authentication is required.');
    error.status = 401;
    error.code = 'UNAUTHENTICATED';
    return next(error);
  }

  try {
    const user = await supabaseApi.verifyAccessToken(match[1]);
    req.auth = { userId: user.id, accessToken: match[1] };
    return next();
  } catch (error) {
    return next(error);
  }
};
