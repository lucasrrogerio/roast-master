import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { roastProfileCreateSchema, roastProfileUpdateSchema } from '../middleware/schemas';

export const roastProfilesRouter = Router();

roastProfilesRouter.use(authMiddleware);

// GET /roast-profiles - List all profiles
roastProfilesRouter.get('/', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const profiles = await prisma.roastProfile.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(profiles);
});

// GET /roast-profiles/:id - Get single profile
roastProfilesRouter.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const profile = await prisma.roastProfile.findUnique({
    where: { id },
  });
  if (!profile) {
    res.status(404).json({ error: 'Perfil de torra não encontrado' });
    return;
  }
  res.json(profile);
});

// POST /roast-profiles - Create profile
roastProfilesRouter.post('/', requireRole(['ROAST_MASTER']), validateBody(roastProfileCreateSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, target_bean_variety, charge_temp, development_time_sec, drop_temp, target_agtron, flavor_notes } =
    req.body;

  const created = await prisma.roastProfile.create({
    data: {
      name,
      target_bean_variety: target_bean_variety || null,
      charge_temp: Number(charge_temp),
      development_time_sec: Number(development_time_sec),
      drop_temp: Number(drop_temp),
      target_agtron: target_agtron !== undefined && target_agtron !== null && target_agtron !== '' ? Number(target_agtron) : null,
      flavor_notes: flavor_notes || null,
    },
  });

  res.status(201).json(created);
});

// PUT /roast-profiles/:id - Update profile
roastProfilesRouter.put('/:id', requireRole(['ROAST_MASTER']), validateBody(roastProfileUpdateSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, target_bean_variety, charge_temp, development_time_sec, drop_temp, target_agtron, flavor_notes } =
    req.body;
  const id = String(req.params.id);

  const existing = await prisma.roastProfile.findUnique({
    where: { id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Perfil de torra não encontrado' });
    return;
  }

  const updated = await prisma.roastProfile.update({
    where: { id },
    data: {
      name: name ?? undefined,
      target_bean_variety: target_bean_variety !== undefined ? (target_bean_variety || null) : undefined,
      charge_temp: charge_temp !== undefined && charge_temp !== null ? Number(charge_temp) : undefined,
      development_time_sec: development_time_sec !== undefined && development_time_sec !== null ? Number(development_time_sec) : undefined,
      drop_temp: drop_temp !== undefined && drop_temp !== null ? Number(drop_temp) : undefined,
      target_agtron: target_agtron !== undefined && target_agtron !== null && target_agtron !== '' ? Number(target_agtron) : undefined,
      flavor_notes: flavor_notes !== undefined ? (flavor_notes || null) : undefined,
    },
  });

  res.json(updated);
});

// DELETE /roast-profiles/:id - Delete profile
roastProfilesRouter.delete('/:id', requireRole(['ROAST_MASTER']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);

  const usedCount = await prisma.roastBatch.count({
    where: { roast_profile_id: id },
  });
  if (usedCount > 0) {
    res.status(400).json({ error: 'Não é possível excluir este perfil pois já foi utilizado em batidas de torra' });
    return;
  }

  const existing = await prisma.roastProfile.findUnique({
    where: { id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Perfil não encontrado' });
    return;
  }

  await prisma.roastProfile.delete({
    where: { id },
  });

  res.json({ message: 'Perfil removido com sucesso' });
});
