import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

// GET /dashboard/stats - KPI stats for manager dashboard using Prisma ORM
dashboardRouter.get('/stats', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // 1. Monthly roast batches stats
  const monthlyRoasts = await prisma.roastBatch.findMany({
    where: {
      roasted_at: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const totalRoastedMonth = monthlyRoasts.reduce((acc, r) => acc + r.final_weight_kg, 0);
  const totalInitialMonth = monthlyRoasts.reduce((acc, r) => acc + r.initial_weight_kg, 0);
  const totalRoastCount = monthlyRoasts.length;
  const avgWeightLossPct =
    totalRoastCount > 0
      ? monthlyRoasts.reduce((acc, r) => acc + r.weight_loss_pct, 0) / totalRoastCount
      : 0;

  // 2. Green beans stats
  const allGreenBeans = await prisma.greenBeanBatch.findMany({
    include: { origin: true },
    orderBy: { current_quantity_kg: 'asc' },
  });

  const totalGreenStockKg = allGreenBeans.reduce((acc, g) => acc + g.current_quantity_kg, 0);

  // 3. Alerts
  const lowGreenBeans = allGreenBeans
    .filter((g) => g.current_quantity_kg <= 20.0)
    .map((g) => ({
      ...g,
      origin_name: g.origin.name,
      farm_name: g.origin.farm_name,
    }));

  const lowProductSkus = await prisma.productSku.findMany({
    where: {
      current_stock_units: {
        lte: 10,
      },
    },
    orderBy: {
      current_stock_units: 'asc',
    },
  });

  // 4. Loss by variety
  const allRoastsWithGreen = await prisma.roastBatch.findMany({
    include: {
      green_bean_batch: true,
    },
  });

  const varietyMap = new Map<string, { count: number; totalLoss: number; totalFinalKg: number }>();

  for (const r of allRoastsWithGreen) {
    const variety = r.green_bean_batch.variety;
    const current = varietyMap.get(variety) || { count: 0, totalLoss: 0, totalFinalKg: 0 };
    current.count += 1;
    current.totalLoss += r.weight_loss_pct;
    current.totalFinalKg += r.final_weight_kg;
    varietyMap.set(variety, current);
  }

  const lossByVariety = Array.from(varietyMap.entries())
    .map(([variety, data]) => ({
      variety,
      roasts_count: data.count,
      avg_loss_pct: Number((data.totalLoss / data.count).toFixed(2)),
      total_roasted_kg: Number(data.totalFinalKg.toFixed(2)),
    }))
    .sort((a, b) => b.total_roasted_kg - a.total_roasted_kg)
    .slice(0, 5);

  // 5. Recent roasts
  const recentRoastsRaw = await prisma.roastBatch.findMany({
    take: 5,
    orderBy: {
      roasted_at: 'desc',
    },
    include: {
      green_bean_batch: true,
      roast_profile: true,
      user: true,
    },
  });

  const recentRoasts = recentRoastsRaw.map((rb) => ({
    ...rb,
    variety: rb.green_bean_batch.variety,
    profile_name: rb.roast_profile.name,
    roast_master_name: rb.user.name,
  }));

  res.json({
    kpis: {
      total_roasted_month_kg: Number(totalRoastedMonth.toFixed(2)),
      total_initial_month_kg: Number(totalInitialMonth.toFixed(2)),
      total_roast_count_month: totalRoastCount,
      avg_weight_loss_pct: Number(avgWeightLossPct.toFixed(2)),
      total_green_stock_kg: Number(totalGreenStockKg.toFixed(2)),
    },
    alerts: {
      low_green_beans: lowGreenBeans,
      low_product_skus: lowProductSkus,
    },
    loss_by_variety: lossByVariety,
    recent_roasts: recentRoasts,
  });
});
