import 'dotenv/config';
import express from 'express';
import { requireAuth } from './middleware/requireAuth.js';
import ingredientsRouter from './routes/ingredients.js';
import { sendSuccess, sendError } from './utils/response.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  sendSuccess(res, { message: 'Hello, GETIT' });
});

app.use('/api/ingredients', requireAuth, ingredientsRouter);

app.use((req, res) => {
  sendError(res, '요청한 경로를 찾을 수 없습니다.', 404);
});

app.use((err, req, res, next) => {
  // 잘못된 JSON 등 요청 자체가 잘못된 경우는 400으로 돌려준다.
  if (err.type === 'entity.parse.failed') {
    return sendError(res, '요청 형식이 올바르지 않습니다.', 400);
  }

  console.error('처리되지 않은 오류:', err);
  sendError(res, '서버 오류가 발생했습니다.', 500);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
