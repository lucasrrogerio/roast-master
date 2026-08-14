import { prisma } from '../db';

export interface CreatePackagingInput {
  package_batch_code: string;
  roast_batch_id: string;
  product_sku_id: string;
  units_produced: number;
  notes?: string;
}

export class PackagingService {
  /**
   * Registers packaging batch, increments SKU stock, and verifies that roasted coffee from roast_batch is not over-allocated.
   */
  static async createPackagingBatch(input: CreatePackagingInput) {
    const { package_batch_code, roast_batch_id, product_sku_id, units_produced, notes } = input;

    if (units_produced <= 0) {
      throw new Error('A quantidade de unidades produzidas deve ser maior que zero');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Get roast batch
      const roastBatch = await tx.roastBatch.findUnique({
        where: { id: roast_batch_id },
      });

      if (!roastBatch) {
        throw new Error('Batida de torra não encontrada');
      }

      // 2. Get SKU
      const sku = await tx.productSku.findUnique({
        where: { id: product_sku_id },
      });

      if (!sku) {
        throw new Error('Produto (SKU) não encontrado');
      }

      // 3. Calculate roasted coffee needed
      const totalRoastedUsedKg = Number(((sku.package_weight_g * units_produced) / 1000).toFixed(3));

      // Calculate already packaged kg for this roast batch
      const packagedSum = await tx.packagingBatch.aggregate({
        where: { roast_batch_id },
        _sum: { total_roasted_used_kg: true },
      });

      const usedKg = packagedSum._sum.total_roasted_used_kg || 0;
      const remainingRoastedKg = Number((roastBatch.final_weight_kg - usedKg).toFixed(3));

      if (totalRoastedUsedKg > remainingRoastedKg) {
        throw new Error(
          `Café torrado insuficiente na batida: Disponível ${remainingRoastedKg.toFixed(2)} kg, necessário ${totalRoastedUsedKg.toFixed(2)} kg para ${units_produced} unidades.`
        );
      }

      // 4. Check duplicate package code
      const existing = await tx.packagingBatch.findUnique({
        where: { package_batch_code },
      });
      if (existing) {
        throw new Error('Já existe um lote de empacotamento com este código');
      }

      // 5. Insert packaging batch
      const created = await tx.packagingBatch.create({
        data: {
          package_batch_code,
          roast_batch_id,
          product_sku_id,
          units_produced,
          total_roasted_used_kg: totalRoastedUsedKg,
          notes: notes || null,
        },
        include: {
          roast_batch: true,
          product_sku: true,
        },
      });

      // 6. Increment SKU stock
      await tx.productSku.update({
        where: { id: product_sku_id },
        data: {
          current_stock_units: sku.current_stock_units + units_produced,
        },
      });

      return {
        ...created,
        roast_batch_code: created.roast_batch.batch_code,
        sku_name: created.product_sku.name,
        sku_code: created.product_sku.sku_code,
        package_weight_g: created.product_sku.package_weight_g,
      };
    });
  }
}
