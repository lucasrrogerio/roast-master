import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const originCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  producer: z.string().min(1, 'Produtor é obrigatório'),
  region: z.string().min(1, 'Região é obrigatória'),
  farm_name: z.string().min(1, 'Nome da fazenda é obrigatório'),
  altitude: z.coerce.number().optional().nullable(),
});

export const originUpdateSchema = originCreateSchema.partial();

export const greenBeanCreateSchema = z.object({
  batch_code: z.string().min(1, 'Código do lote é obrigatório'),
  origin_id: z.string().uuid().or(z.string().min(1)),
  variety: z.string().min(1, 'Variedade é obrigatória'),
  process_method: z.string().min(1, 'Método de processamento é obrigatório'),
  harvest_year: z.string().min(1, 'Safra/Ano é obrigatório'),
  moisture_pct: z.coerce.number().min(0, 'Umidade não pode ser negativa'),
  sca_score: z.coerce.number().min(0).max(100).optional().nullable(),
  initial_quantity_kg: z.coerce.number().positive('Quantidade inicial deve ser maior que zero'),
  cost_per_kg: z.coerce.number().min(0, 'Custo por kg não pode ser negativo'),
  notes: z.string().optional().nullable(),
});

export const greenBeanUpdateSchema = z.object({
  notes: z.string().optional().nullable(),
  sca_score: z.coerce.number().min(0).max(100).optional().nullable(),
  moisture_pct: z.coerce.number().min(0).optional().nullable(),
  cost_per_kg: z.coerce.number().min(0).optional().nullable(),
});

export const roastProfileCreateSchema = z.object({
  name: z.string().min(1, 'Nome da receita/perfil é obrigatório'),
  target_bean_variety: z.string().optional().nullable(),
  charge_temp: z.coerce.number().positive('Temperatura de carga deve ser positiva'),
  development_time_sec: z.coerce.number().int().positive('Tempo de desenvolvimento deve ser positivo'),
  drop_temp: z.coerce.number().positive('Temperatura de descarga deve ser positiva'),
  target_agtron: z.coerce.number().int().optional().nullable(),
  flavor_notes: z.string().optional().nullable(),
});

export const roastProfileUpdateSchema = roastProfileCreateSchema.partial();

export const roastBatchCreateSchema = z.object({
  batch_code: z.string().min(1, 'Código do lote de torra é obrigatório'),
  green_bean_batch_id: z.string().min(1, 'Lote de grão cru é obrigatório'),
  roast_profile_id: z.string().min(1, 'Perfil de torra é obrigatório'),
  initial_weight_kg: z.coerce.number().positive('Peso inicial deve ser maior que zero'),
  final_weight_kg: z.coerce.number().positive('Peso final deve ser maior que zero'),
  notes: z.string().optional().nullable(),
});

export const productSkuCreateSchema = z.object({
  sku_code: z.string().min(1, 'Código SKU é obrigatório'),
  name: z.string().min(1, 'Nome do produto é obrigatório'),
  package_weight_g: z.coerce.number().positive('Peso da embalagem (g) deve ser positivo'),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Preço deve ser maior ou igual a zero').default(0),
});

export const productSkuUpdateSchema = productSkuCreateSchema.partial().extend({
  current_stock_units: z.coerce.number().int().min(0).optional(),
});

export const packagingBatchCreateSchema = z.object({
  package_batch_code: z.string().min(1, 'Código do lote de empacotamento é obrigatório'),
  roast_batch_id: z.string().min(1, 'Lote de torra é obrigatório'),
  product_sku_id: z.string().min(1, 'Produto SKU é obrigatório'),
  units_produced: z.coerce.number().int().positive('Quantidade de unidades produzidas deve ser maior que zero'),
  notes: z.string().optional().nullable(),
});
