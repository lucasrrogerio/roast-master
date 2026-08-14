import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { originCreateSchema, originUpdateSchema } from '../middleware/schemas';

export const originsRouter = Router();

originsRouter.use(authMiddleware);

// GET /origins - List all origins
originsRouter.get('/', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const origins = await prisma.origin.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(origins);
});

// GET /origins/:id - Get single origin
originsRouter.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const origin = await prisma.origin.findUnique({
    where: { id },
  });
  if (!origin) {
    res.status(404).json({ error: 'Origem não encontrada' });
    return;
  }
  res.json(origin);
});

// POST /origins - Create origin
originsRouter.post('/', requireRole(['STOCKIST']), validateBody(originCreateSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, producer, region, farm_name, altitude } = req.body;

  const created = await prisma.origin.create({
    data: {
      name,
      producer,
      region,
      farm_name,
      altitude: altitude !== undefined && altitude !== null ? Number(altitude) : null,
    },
  });

  res.status(201).json(created);
});

// PUT /origins/:id - Update origin
originsRouter.put('/:id', requireRole(['STOCKIST']), validateBody(originUpdateSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, producer, region, farm_name, altitude } = req.body;
  const id = String(req.params.id);

  const existing = await prisma.origin.findUnique({
    where: { id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Origem não encontrada' });
    return;
  }

  const updated = await prisma.origin.update({
    where: { id },
    data: {
      name: name ?? undefined,
      producer: producer ?? undefined,
      region: region ?? undefined,
      farm_name: farm_name ?? undefined,
      altitude: altitude !== undefined && altitude !== null ? Number(altitude) : undefined,
    },
  });

  res.json(updated);
});

// DELETE /origins/:id - Delete origin
originsRouter.delete('/:id', requireRole(['STOCKIST']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);

  const batchesCount = await prisma.greenBeanBatch.count({
    where: { origin_id: id },
  });
  if (batchesCount > 0) {
    res.status(400).json({ error: 'Não é possível excluir esta origem pois há lotes de grão cru vinculados' });
    return;
  }

  const existing = await prisma.origin.findUnique({
    where: { id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Origem não encontrada' });
    return;
  }

  await prisma.origin.delete({
    where: { id },
  });

  res.json({ message: 'Origem removida com sucesso' });
});
