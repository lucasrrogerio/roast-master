import { createApp } from './app';
import dotenv from 'dotenv';

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Roast Master Web Backend running on http://localhost:${PORT}`);
});
