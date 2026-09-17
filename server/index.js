import express from 'express';
import { sendSuccess } from './utils/response.js';

const app = express();
const PORT = 4000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  sendSuccess(res, { message: 'Hello, GETIT' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
