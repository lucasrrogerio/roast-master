import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { packagingBatchCreateSchema } from '../middleware/schemas';
import { PackagingService } from '../services/packagingService';

export const packagingBatchesRouter = Router();

packagingBatchesRouter.use(authMiddleware);

function formatPackagingBatch(batch: any) {
  return {
    ...batch,
    roast_batch_code: batch.roast_batch?.batch_code,
    sku_name: batch.product_sku?.name,
    sku_code: batch.product_sku?.sku_code,
    package_weight_g: batch.product_sku?.package_weight_g,
  };
}

// GET /packaging-batches - List all packaging batches
packagingBatchesRouter.get('/', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const batches = await prisma.packagingBatch.findMany({
    include: {
      roast_batch: true,
      product_sku: true,
    },
    orderBy: { packaged_at: 'desc' },
  });

  res.json(batches.map(formatPackagingBatch));
});

// POST /packaging-batches - Register packaging batch
packagingBatchesRouter.post('/', requireRole(['STOCKIST']), validateBody(packagingBatchCreateSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { package_batch_code, roast_batch_id, product_sku_id, units_produced, notes } = req.body;

    const result = await PackagingService.createPackagingBatch({
      package_batch_code,
      roast_batch_id,
      product_sku_id,
      units_produced: Number(units_produced),
      notes,
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message.includes('insuficiente')) {
      res.status(422).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
});
