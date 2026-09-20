import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

router.get('/', async (req, res) => {
  const { data, error } = await req.supabase
    .from('favorites')
    .select('id, recipe_id, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('즐겨찾기 목록 조회 실패:', error);
    return sendError(res, '즐겨찾기 목록을 불러오지 못했습니다.', 500);
  }

  sendSuccess(res, { favorites: data });
});

router.post('/', async (req, res) => {
  const { recipe_id: recipeId } = req.body ?? {};

  if (typeof recipeId !== 'string' || recipeId.trim() === '') {
    return sendError(res, '레시피 ID가 필요합니다.', 400);
  }

  const { data, error } = await req.supabase
    .from('favorites')
    .insert({ user_id: req.user.id, recipe_id: recipeId.trim() })
    .select('id, recipe_id, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return sendError(res, '이미 즐겨찾기한 레시피입니다.', 409);
    }
    console.error('즐겨찾기 추가 실패:', error);
    return sendError(res, '즐겨찾기를 추가하지 못했습니다.', 500);
  }

  sendSuccess(res, { favorite: data }, 201);
});

// 레시피 카드에서 바로 해제할 수 있도록 행 id가 아니라 recipe_id로 지운다.
router.delete('/:recipeId', async (req, res) => {
  const { data, error } = await req.supabase
    .from('favorites')
    .delete()
    .eq('recipe_id', req.params.recipeId)
    .select('recipe_id');

  if (error) {
    console.error('즐겨찾기 해제 실패:', error);
    return sendError(res, '즐겨찾기를 해제하지 못했습니다.', 500);
  }

  if (data.length === 0) {
    return sendError(res, '즐겨찾기를 찾을 수 없습니다.', 404);
  }

  sendSuccess(res, { recipe_id: req.params.recipeId });
});

export default router;
