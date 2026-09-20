import { supabase, createUserClient } from '../supabaseClient.js';
import { sendError } from '../utils/response.js';

// Authorization 헤더의 Supabase 토큰만 신뢰한다. body/query의 user_id는 쓰지 않는다.
export const requireAuth = async (req, res, next) => {
  const header = req.get('authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return sendError(res, '로그인이 필요합니다.', 401);
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return sendError(res, '로그인이 필요합니다.', 401);
  }

  req.user = data.user;
  req.supabase = createUserClient(token);
  next();
};
