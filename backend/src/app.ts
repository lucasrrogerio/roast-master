import express from 'express';
import cors from 'cors';
import { initDatabase } from './db';
import { authRouter } from './routes/auth';
import { originsRouter } from './routes/origins';
import { greenBeansRouter } from './routes/greenBeans';
import { roastProfilesRouter } from './routes/roastProfiles';
import { roastBatchesRouter } from './routes/roastBatches';
import { productsRouter } from './routes/products';
import { packagingBatchesRouter } from './routes/packagingBatches';
import { traceabilityRouter } from './routes/traceability';
import { dashboardRouter } from './routes/dashboard';

export function createApp() {
  initDatabase();

  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/auth', authRouter);
  app.use('/origins', originsRouter);
  app.use('/green-beans', greenBeansRouter);
  app.use('/roast-profiles', roastProfilesRouter);
  app.use('/roast-batches', roastBatchesRouter);
  app.use('/products', productsRouter);
  app.use('/packaging-batches', packagingBatchesRouter);
  app.use('/traceability', traceabilityRouter);
  app.use('/dashboard', dashboardRouter);

  return app;
}
