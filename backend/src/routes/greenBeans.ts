import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { greenBeanCreateSchema, greenBeanUpdateSchema } from '../middleware/schemas';

export const greenBeansRouter = Router();

greenBeansRouter.use(authMiddleware);

function formatGreenBean(batch: any) {
  return {
    ...batch,
    origin_name: batch.origin?.name,
    origin_producer: batch.origin?.producer,
    origin_region: batch.origin?.region,
    origin_farm_name: batch.origin?.farm_name,
    origin_altitude: batch.origin?.altitude,
  };
}

// GET /green-beans - List green bean batches with origin info
greenBeansRouter.get('/', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const batches = await prisma.greenBeanBatch.findMany({
    include: { origin: true },
    orderBy: { created_at: 'desc' },
  });
  res.json(batches.map(formatGreenBean));
});

// GET /green-beans/:id - Get single batch
greenBeansRouter.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const batch = await prisma.greenBeanBatch.findUnique({
    where: { id },
    include: { origin: true },
  });

  if (!batch) {
    res.status(404).json({ error: 'Lote de grão cru não encontrado' });
    return;
  }
  res.json(formatGreenBean(batch));
});

// POST /green-beans - Register green bean entry
greenBeansRouter.post('/', requireRole(['STOCKIST']), validateBody(greenBeanCreateSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    batch_code,
    origin_id,
    variety,
    process_method,
    harvest_year,
    moisture_pct,
    sca_score,
    initial_quantity_kg,
    cost_per_kg,
    notes,
  } = req.body;

  const origin = await prisma.origin.findUnique({
    where: { id: origin_id },
  });
  if (!origin) {
    res.status(400).json({ error: 'Origem selecionada não existe' });
    return;
  }

  const existingBatch = await prisma.greenBeanBatch.findUnique({
    where: { batch_code },
  });
  if (existingBatch) {
    res.status(400).json({ error: 'Já existe um lote com este código' });
    return;
  }

  const created = await prisma.greenBeanBatch.create({
    data: {
      batch_code,
      origin_id,
      variety,
      process_method,
      harvest_year,
      moisture_pct: Number(moisture_pct),
      sca_score: sca_score !== undefined && sca_score !== null && sca_score !== '' ? Number(sca_score) : null,
      initial_quantity_kg: Number(initial_quantity_kg),
      current_quantity_kg: Number(initial_quantity_kg), // saldo inicial = quantidade inicial
      cost_per_kg: Number(cost_per_kg),
      notes: notes || null,
    },
    include: { origin: true },
  });

  res.status(201).json(formatGreenBean(created));
});

// PUT /green-beans/:id - Update batch metadata
greenBeansRouter.put('/:id', requireRole(['STOCKIST']), validateBody(greenBeanUpdateSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { notes, sca_score, moisture_pct, cost_per_kg } = req.body;
  const id = String(req.params.id);

  const existing = await prisma.greenBeanBatch.findUnique({
    where: { id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Lote não encontrado' });
    return;
  }

  const updated = await prisma.greenBeanBatch.update({
    where: { id },
    data: {
      notes: notes !== undefined ? notes : undefined,
      sca_score: sca_score !== undefined && sca_score !== null && sca_score !== '' ? Number(sca_score) : undefined,
      moisture_pct: moisture_pct !== undefined && moisture_pct !== null ? Number(moisture_pct) : undefined,
      cost_per_kg: cost_per_kg !== undefined && cost_per_kg !== null ? Number(cost_per_kg) : undefined,
    },
    include: { origin: true },
  });

  res.json(formatGreenBean(updated));
});
