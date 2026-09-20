import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

router.get('/', async (req, res) => {
  const { data, error } = await req.supabase
    .from('ingredients')
    .select('id, name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('재료 목록 조회 실패:', error);
    return sendError(res, '재료 목록을 불러오지 못했습니다.', 500);
  }

  sendSuccess(res, { ingredients: data });
});

router.post('/', async (req, res) => {
  const { name } = req.body ?? {};

  if (typeof name !== 'string' || name.trim() === '') {
    return sendError(res, '재료 이름을 입력해 주세요.', 400);
  }

  const { data, error } = await req.supabase
    .from('ingredients')
    .insert({ user_id: req.user.id, name: name.trim() })
    .select('id, name, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return sendError(res, '이미 등록한 재료입니다.', 409);
    }
    console.error('재료 추가 실패:', error);
    return sendError(res, '재료를 추가하지 못했습니다.', 500);
  }

  sendSuccess(res, { ingredient: data }, 201);
});

router.delete('/:id', async (req, res) => {
  const { data, error } = await req.supabase
    .from('ingredients')
    .delete()
    .eq('id', req.params.id)
    .select('id');

  if (error) {
    console.error('재료 삭제 실패:', error);
    return sendError(res, '재료를 삭제하지 못했습니다.', 500);
  }

  if (data.length === 0) {
    return sendError(res, '재료를 찾을 수 없습니다.', 404);
  }

  sendSuccess(res, { id: req.params.id });
});

export default router;
