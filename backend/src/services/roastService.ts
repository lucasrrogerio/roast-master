import { prisma } from '../db';

export interface CreateRoastBatchInput {
  batch_code: string;
  green_bean_batch_id: string;
  roast_profile_id: string;
  user_id: string;
  initial_weight_kg: number;
  final_weight_kg: number;
  notes?: string;
}

export function calculateWeightLossPct(initialWeightKg: number, finalWeightKg: number): number {
  if (initialWeightKg <= 0) {
    throw new Error('O peso inicial deve ser maior que zero');
  }
  if (finalWeightKg < 0) {
    throw new Error('O peso final não pode ser negativo');
  }
  if (finalWeightKg > initialWeightKg) {
    throw new Error('O peso final não pode ser maior que o peso inicial');
  }

  const loss = ((initialWeightKg - finalWeightKg) / initialWeightKg) * 100;
  return Number(loss.toFixed(2));
}

export class RoastService {
  /**
   * Registers a roast batch, calculates weight loss, and decrements green bean stock atomically with Prisma transaction.
   */
  static async createRoastBatch(input: CreateRoastBatchInput) {
    const {
      batch_code,
      green_bean_batch_id,
      roast_profile_id,
      user_id,
      initial_weight_kg,
      final_weight_kg,
      notes,
    } = input;

    if (initial_weight_kg <= 0) {
      throw new Error('O peso inicial deve ser maior que zero');
    }
    if (final_weight_kg <= 0) {
      throw new Error('O peso final deve ser maior que zero');
    }
    if (final_weight_kg > initial_weight_kg) {
      throw new Error('O peso final não pode ser maior que o peso inicial');
    }

    const weightLossPct = calculateWeightLossPct(initial_weight_kg, final_weight_kg);

    return await prisma.$transaction(async (tx) => {
      // 1. Check green bean stock with lock/read
      const greenBean = await tx.greenBeanBatch.findUnique({
        where: { id: green_bean_batch_id },
        include: { origin: true },
      });

      if (!greenBean) {
        throw new Error('Lote de grão cru não encontrado');
      }

      if (greenBean.current_quantity_kg < initial_weight_kg) {
        throw new Error(
          `Estoque Insuficiente: Lote possui apenas ${greenBean.current_quantity_kg.toFixed(2)} kg disponível, necessário ${initial_weight_kg.toFixed(2)} kg`
        );
      }

      // 2. Check profile existence
      const profile = await tx.roastProfile.findUnique({
        where: { id: roast_profile_id },
      });
      if (!profile) {
        throw new Error('Perfil de torra não encontrado');
      }

      // 3. Check duplicate batch code
      const existingCode = await tx.roastBatch.findUnique({
        where: { batch_code },
      });
      if (existingCode) {
        throw new Error('Já existe uma batida de torra com este código de lote');
      }

      // 4. Decrement green bean stock
      const newQuantity = Number((greenBean.current_quantity_kg - initial_weight_kg).toFixed(3));
      await tx.greenBeanBatch.update({
        where: { id: green_bean_batch_id },
        data: { current_quantity_kg: newQuantity },
      });

      // 5. Insert roast batch
      const created = await tx.roastBatch.create({
        data: {
          batch_code,
          green_bean_batch_id,
          roast_profile_id,
          user_id,
          initial_weight_kg,
          final_weight_kg,
          weight_loss_pct: weightLossPct,
          notes: notes || null,
        },
        include: {
          green_bean_batch: {
            include: { origin: true },
          },
          roast_profile: true,
          user: true,
        },
      });

      return {
        ...created,
        green_batch_code: created.green_bean_batch.batch_code,
        green_variety: created.green_bean_batch.variety,
        origin_name: created.green_bean_batch.origin.name,
        farm_name: created.green_bean_batch.origin.farm_name,
        profile_name: created.roast_profile.name,
        user_name: created.user.name,
      };
    });
  }
}
