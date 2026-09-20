// server/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
}

// 토큰 검증 등 사용자 컨텍스트가 필요 없는 작업용
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 요청별 클라이언트. 사용자 토큰을 붙여야 RLS가 본인 행만 허용한다.
export const createUserClient = (accessToken) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
