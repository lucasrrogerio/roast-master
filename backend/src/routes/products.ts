import { Router, Response } from 'express';
import { prisma } from '../db';
import { authMiddleware, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { productSkuCreateSchema, productSkuUpdateSchema } from '../middleware/schemas';

export const productsRouter = Router();

productsRouter.use(authMiddleware);

// GET /products - List all SKUs
productsRouter.get('/', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const skus = await prisma.productSku.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(skus);
});

// GET /products/:id - Get single SKU
productsRouter.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const sku = await prisma.productSku.findUnique({
    where: { id },
  });
  if (!sku) {
    res.status(404).json({ error: 'Produto (SKU) não encontrado' });
    return;
  }
  res.json(sku);
});

// POST /products - Create SKU
productsRouter.post('/', requireRole(['STOCKIST']), validateBody(productSkuCreateSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { sku_code, name, package_weight_g, description, price } = req.body;

  const existing = await prisma.productSku.findUnique({
    where: { sku_code },
  });
  if (existing) {
    res.status(400).json({ error: 'Já existe um produto com este código SKU' });
    return;
  }

  const created = await prisma.productSku.create({
    data: {
      sku_code,
      name,
      package_weight_g: Number(package_weight_g),
      description: description || null,
      price: price !== undefined && price !== null ? Number(price) : 0.0,
      current_stock_units: 0,
    },
  });

  res.status(201).json(created);
});

// PUT /products/:id - Update SKU
productsRouter.put('/:id', requireRole(['STOCKIST']), validateBody(productSkuUpdateSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, package_weight_g, description, price, current_stock_units } = req.body;
  const id = String(req.params.id);

  const existing = await prisma.productSku.findUnique({
    where: { id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Produto não encontrado' });
    return;
  }

  const updated = await prisma.productSku.update({
    where: { id },
    data: {
      name: name ?? undefined,
      package_weight_g: package_weight_g !== undefined && package_weight_g !== null ? Number(package_weight_g) : undefined,
      description: description !== undefined ? (description || null) : undefined,
      price: price !== undefined && price !== null ? Number(price) : undefined,
      current_stock_units: current_stock_units !== undefined && current_stock_units !== null ? Number(current_stock_units) : undefined,
    },
  });

  res.json(updated);
});
