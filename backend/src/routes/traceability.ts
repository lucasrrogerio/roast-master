import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

export const traceabilityRouter = Router();

traceabilityRouter.use(authMiddleware);

// GET /traceability/:packageCode - Search full traceability tree from package code using Prisma relations
traceabilityRouter.get('/:packageCode', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const packageCode = String(req.params.packageCode);

  const pkg = (await prisma.packagingBatch.findFirst({
    where: {
      OR: [
        { package_batch_code: packageCode },
        { id: packageCode },
      ],
    },
    include: {
      product_sku: true,
      roast_batch: {
        include: {
          roast_profile: true,
          user: true,
          green_bean_batch: {
            include: {
              origin: true,
            },
          },
        },
      },
    },
  })) as any;

  if (!pkg) {
    res.status(404).json({ error: 'Lote de empacotamento não encontrado' });
    return;
  }

  const roast = pkg.roast_batch;
  const green = roast.green_bean_batch;
  const origin = green.origin;
  const profile = roast.roast_profile;
  const user = roast.user;
  const sku = pkg.product_sku;

  res.json({
    package: {
      id: pkg.id,
      package_batch_code: pkg.package_batch_code,
      units_produced: pkg.units_produced,
      total_roasted_used_kg: pkg.total_roasted_used_kg,
      packaged_at: pkg.packaged_at,
      notes: pkg.notes,
      sku: {
        id: sku.id,
        sku_code: sku.sku_code,
        name: sku.name,
        package_weight_g: sku.package_weight_g,
      },
    },
    roast: {
      id: roast.id,
      batch_code: roast.batch_code,
      initial_weight_kg: roast.initial_weight_kg,
      final_weight_kg: roast.final_weight_kg,
      weight_loss_pct: roast.weight_loss_pct,
      roasted_at: roast.roasted_at,
      notes: roast.notes,
      roast_master: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      profile: {
        id: profile.id,
        name: profile.name,
        charge_temp: profile.charge_temp,
        development_time_sec: profile.development_time_sec,
        drop_temp: profile.drop_temp,
        target_agtron: profile.target_agtron,
        flavor_notes: profile.flavor_notes,
      },
    },
    greenBean: {
      id: green.id,
      batch_code: green.batch_code,
      variety: green.variety,
      process_method: green.process_method,
      harvest_year: green.harvest_year,
      moisture_pct: green.moisture_pct,
      sca_score: green.sca_score,
      initial_quantity_kg: green.initial_quantity_kg,
      current_quantity_kg: green.current_quantity_kg,
      cost_per_kg: green.cost_per_kg,
      origin: {
        id: origin.id,
        name: origin.name,
        producer: origin.producer,
        region: origin.region,
        farm_name: origin.farm_name,
        altitude: origin.altitude,
      },
    },
  });
});
