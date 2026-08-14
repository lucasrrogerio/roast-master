export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ROAST_MASTER' | 'STOCKIST';
}

export interface Origin {
  id: string;
  name: string;
  producer: string;
  region: string;
  farm_name: string;
  altitude?: number;
  created_at: string;
}

export interface GreenBeanBatch {
  id: string;
  batch_code: string;
  origin_id: string;
  variety: string;
  process_method: string;
  harvest_year: string;
  moisture_pct: number;
  sca_score?: number;
  initial_quantity_kg: number;
  current_quantity_kg: number;
  cost_per_kg: number;
  notes?: string;
  origin_name?: string;
  origin_producer?: string;
  origin_region?: string;
  origin_farm_name?: string;
  origin_altitude?: number;
  created_at: string;
}

export interface RoastProfile {
  id: string;
  name: string;
  target_bean_variety?: string;
  charge_temp: number;
  development_time_sec: number;
  drop_temp: number;
  target_agtron?: number;
  flavor_notes?: string;
  created_at: string;
}

export interface RoastBatch {
  id: string;
  batch_code: string;
  green_bean_batch_id: string;
  roast_profile_id: string;
  user_id: string;
  initial_weight_kg: number;
  final_weight_kg: number;
  weight_loss_pct: number;
  roasted_at: string;
  notes?: string;
  green_batch_code?: string;
  green_variety?: string;
  origin_name?: string;
  farm_name?: string;
  profile_name?: string;
  user_name?: string;
  roast_master_name?: string;
}

export interface ProductSKU {
  id: string;
  sku_code: string;
  name: string;
  package_weight_g: number;
  description?: string;
  price: number;
  current_stock_units: number;
  created_at: string;
}

export interface PackagingBatch {
  id: string;
  package_batch_code: string;
  roast_batch_id: string;
  product_sku_id: string;
  units_produced: number;
  total_roasted_used_kg: number;
  packaged_at: string;
  notes?: string;
  roast_batch_code?: string;
  sku_name?: string;
  sku_code?: string;
  package_weight_g?: number;
}

export interface TraceabilityResult {
  package: {
    id: string;
    package_batch_code: string;
    units_produced: number;
    total_roasted_used_kg: number;
    packaged_at: string;
    notes?: string;
    sku: {
      id: string;
      sku_code: string;
      name: string;
      package_weight_g: number;
    };
  };
  roast: {
    id: string;
    batch_code: string;
    initial_weight_kg: number;
    final_weight_kg: number;
    weight_loss_pct: number;
    roasted_at: string;
    notes?: string;
    roast_master: {
      id: string;
      name: string;
      email: string;
    };
    profile: {
      id: string;
      name: string;
      charge_temp: number;
      development_time_sec: number;
      drop_temp: number;
      target_agtron?: number;
      flavor_notes?: string;
    };
  };
  greenBean: {
    id: string;
    batch_code: string;
    variety: string;
    process_method: string;
    harvest_year: string;
    moisture_pct: number;
    sca_score?: number;
    initial_quantity_kg: number;
    current_quantity_kg: number;
    cost_per_kg: number;
    origin: {
      id: string;
      name: string;
      producer: string;
      region: string;
      farm_name: string;
      altitude?: number;
    };
  };
}

export interface DashboardStats {
  kpis: {
    total_roasted_month_kg: number;
    total_initial_month_kg: number;
    total_roast_count_month: number;
    avg_weight_loss_pct: number;
    total_green_stock_kg: number;
  };
  alerts: {
    low_green_beans: GreenBeanBatch[];
    low_product_skus: ProductSKU[];
  };
  loss_by_variety: Array<{
    variety: string;
    roasts_count: number;
    avg_loss_pct: number;
    total_roasted_kg: number;
  }>;
  recent_roasts: Array<RoastBatch>;
}
