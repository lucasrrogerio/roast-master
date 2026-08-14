import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { roastBatchCreateSchema } from '../middleware/schemas';
import { RoastService } from '../services/roastService';

export const roastBatchesRouter = Router();

roastBatchesRouter.use(authMiddleware);

function formatRoastBatch(batch: any) {
  return {
    ...batch,
    green_batch_code: batch.green_bean_batch?.batch_code,
    green_variety: batch.green_bean_batch?.variety,
    green_process_method: batch.green_bean_batch?.process_method,
    green_moisture_pct: batch.green_bean_batch?.moisture_pct,
    green_sca_score: batch.green_bean_batch?.sca_score,
    origin_name: batch.green_bean_batch?.origin?.name,
    origin_producer: batch.green_bean_batch?.origin?.producer,
    origin_region: batch.green_bean_batch?.origin?.region,
    origin_farm_name: batch.green_bean_batch?.origin?.farm_name,
    origin_altitude: batch.green_bean_batch?.origin?.altitude,
    farm_name: batch.green_bean_batch?.origin?.farm_name,
    profile_name: batch.roast_profile?.name,
    charge_temp: batch.roast_profile?.charge_temp,
    development_time_sec: batch.roast_profile?.development_time_sec,
    drop_temp: batch.roast_profile?.drop_temp,
    target_agtron: batch.roast_profile?.target_agtron,
    user_name: batch.user?.name,
    roast_master_name: batch.user?.name,
  };
}

// GET /roast-batches - List all roast batches
roastBatchesRouter.get('/', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const batches = await prisma.roastBatch.findMany({
    include: {
      green_bean_batch: {
        include: { origin: true },
      },
      roast_profile: true,
      user: true,
    },
    orderBy: { roasted_at: 'desc' },
  });

  res.json(batches.map(formatRoastBatch));
});

// GET /roast-batches/:id - Get single roast batch
roastBatchesRouter.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const batch = await prisma.roastBatch.findUnique({
    where: { id },
    include: {
      green_bean_batch: {
        include: { origin: true },
      },
      roast_profile: true,
      user: true,
    },
  });

  if (!batch) {
    res.status(404).json({ error: 'Batida de torra não encontrada' });
    return;
  }

  res.json(formatRoastBatch(batch));
});

// POST /roast-batches - Create roast batch
roastBatchesRouter.post('/', requireRole(['ROAST_MASTER']), validateBody(roastBatchCreateSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { batch_code, green_bean_batch_id, roast_profile_id, initial_weight_kg, final_weight_kg, notes } =
      req.body;

    const userId = req.user!.id;

    const result = await RoastService.createRoastBatch({
      batch_code,
      green_bean_batch_id,
      roast_profile_id,
      user_id: userId,
      initial_weight_kg: Number(initial_weight_kg),
      final_weight_kg: Number(final_weight_kg),
      notes,
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message.includes('Estoque Insuficiente') || error.message.includes('não pode ser maior')) {
      res.status(422).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
});
