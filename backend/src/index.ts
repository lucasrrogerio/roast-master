import { createApp } from './app';
import dotenv from 'dotenv';

dotenv.config();

const app = createApp();

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Roast Master Web Backend running on http://localhost:${PORT}`);
  });
}

export default app;
