import request from 'supertest';
import { createApp } from '../src/app';
import { prisma, initDatabase } from '../src/db';
import { seedDatabase } from '../src/db/seed';
import { calculateWeightLossPct } from '../src/services/roastService';

describe('Roast Master Core Logic Tests', () => {
  let app: any;
  let adminToken: string;
  let roasterToken: string;
  let stockistToken: string;

  beforeAll(async () => {
    await initDatabase();
    // Clean test data before seeding
    await prisma.packagingBatch.deleteMany();
    await prisma.roastBatch.deleteMany();
    await prisma.productSku.deleteMany();
    await prisma.roastProfile.deleteMany();
    await prisma.greenBeanBatch.deleteMany();
    await prisma.origin.deleteMany();
    await prisma.user.deleteMany();

    await seedDatabase();
    app = createApp();

    // Login users to get tokens
    const adminRes = await request(app).post('/auth/login').send({
      email: 'admin@roastmaster.com',
      password: 'admin123',
    });
    adminToken = adminRes.body.token;

    const roasterRes = await request(app).post('/auth/login').send({
      email: 'mestre@roastmaster.com',
      password: 'roaster123',
    });
    roasterToken = roasterRes.body.token;

    const stockistRes = await request(app).post('/auth/login').send({
      email: 'estoque@roastmaster.com',
      password: 'stock123',
    });
    stockistToken = stockistRes.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Weight Loss Calculation Unit Tests', () => {
    test('calculates correct moisture loss percentage', () => {
      // 10kg initial, 8.5kg final -> 15% loss
      const loss = calculateWeightLossPct(10.0, 8.5);
      expect(loss).toBe(15.0);
    });

    test('calculates precision moisture loss', () => {
      // 12.0kg initial, 10.25kg final -> 14.58% loss
      const loss = calculateWeightLossPct(12.0, 10.25);
      expect(loss).toBe(14.58);
    });

    test('throws error if initial weight is zero or negative', () => {
      expect(() => calculateWeightLossPct(0, 5)).toThrow('maior que zero');
      expect(() => calculateWeightLossPct(-10, 5)).toThrow('maior que zero');
    });

    test('throws error if final weight is greater than initial weight', () => {
      expect(() => calculateWeightLossPct(10, 12)).toThrow('não pode ser maior');
    });
  });

  describe('End-to-End Coffee Flow (Sprint 3.5 Validation)', () => {
    test('Full Journey: Green Bean -> Roast -> Decrement Stock -> Packaging -> Traceability', async () => {
      // 1. Check Initial Green Bean Stock (GV-2026-001 has 60kg)
      const greenBean = await prisma.greenBeanBatch.findUnique({
        where: { batch_code: 'GV-2026-001' },
      });
      expect(greenBean).not.toBeNull();
      expect(greenBean!.current_quantity_kg).toBe(60.0);

      // 2. Perform Roast Batch of 10kg initial, 8.5kg final (Loss 15%)
      const roastRes = await request(app)
        .post('/roast-batches')
        .set('Authorization', `Bearer ${roasterToken}`)
        .send({
          batch_code: 'TORRA-2026-TEST-01',
          green_bean_batch_id: greenBean!.id,
          roast_profile_id: 'profile-01',
          initial_weight_kg: 10.0,
          final_weight_kg: 8.5,
          notes: 'Torra de teste controlada',
        });

      expect(roastRes.status).toBe(201);
      expect(roastRes.body.weight_loss_pct).toBe(15.0);
      const roastBatchId = roastRes.body.id;

      // Check that green bean stock decremented by 10kg (60 - 10 = 50kg)
      const updatedGreenBean = await prisma.greenBeanBatch.findUnique({
        where: { id: greenBean!.id },
      });
      expect(updatedGreenBean!.current_quantity_kg).toBe(50.0);

      // 3. Test Insufficient Stock Error
      const failRoastRes = await request(app)
        .post('/roast-batches')
        .set('Authorization', `Bearer ${roasterToken}`)
        .send({
          batch_code: 'TORRA-FAIL-EXCEED',
          green_bean_batch_id: greenBean!.id,
          roast_profile_id: 'profile-01',
          initial_weight_kg: 100.0, // Only 50kg left
          final_weight_kg: 85.0,
        });

      expect(failRoastRes.status).toBe(422);
      expect(failRoastRes.body.error).toContain('Estoque Insuficiente');

      // 4. Packaging 30 units of 250g (30 * 0.25kg = 7.5kg used out of 8.5kg roasted)
      const packRes = await request(app)
        .post('/packaging-batches')
        .set('Authorization', `Bearer ${stockistToken}`)
        .send({
          package_batch_code: 'LOTE-PAC-2026-001',
          roast_batch_id: roastBatchId,
          product_sku_id: 'sku-01', // 250g SKU
          units_produced: 30,
          notes: 'Empacotamento primeira remessa',
        });

      expect(packRes.status).toBe(201);
      expect(packRes.body.total_roasted_used_kg).toBe(7.5);

      // Check that SKU stock increased by 30 units
      const sku = await prisma.productSku.findUnique({
        where: { id: 'sku-01' },
      });
      expect(sku!.current_stock_units).toBe(30);

      // 5. Test Packaging Over-allocation Error (Remaining roasted = 1.0kg. Trying to package 10 units = 2.5kg)
      const failPackRes = await request(app)
        .post('/packaging-batches')
        .set('Authorization', `Bearer ${stockistToken}`)
        .send({
          package_batch_code: 'LOTE-PAC-FAIL',
          roast_batch_id: roastBatchId,
          product_sku_id: 'sku-01',
          units_produced: 10, // needs 2.5kg, only 1.0kg left
        });

      expect(failPackRes.status).toBe(422);
      expect(failPackRes.body.error).toContain('Café torrado insuficiente');

      // 6. Traceability Query: Search from package batch code
      const traceRes = await request(app)
        .get('/traceability/LOTE-PAC-2026-001')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(traceRes.status).toBe(200);
      expect(traceRes.body.package.package_batch_code).toBe('LOTE-PAC-2026-001');
      expect(traceRes.body.roast.batch_code).toBe('TORRA-2026-TEST-01');
      expect(traceRes.body.roast.roast_master.name).toBe('Mariana Mestre de Torra');
      expect(traceRes.body.greenBean.batch_code).toBe('GV-2026-001');
      expect(traceRes.body.greenBean.origin.farm_name).toBe('Fazenda Sertão');
      expect(traceRes.body.greenBean.origin.producer).toBe('Nazareth Dias Pereira');

      // 7. Dashboard Metrics
      const dashRes = await request(app).get('/dashboard/stats').set('Authorization', `Bearer ${adminToken}`);

      expect(dashRes.status).toBe(200);
      expect(dashRes.body.kpis.total_roasted_month_kg).toBe(8.5);
      expect(dashRes.body.kpis.total_roast_count_month).toBe(1);
      expect(dashRes.body.kpis.avg_weight_loss_pct).toBe(15.0);
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    test('Stockist cannot create roast profiles or roast batches', async () => {
      const resProfile = await request(app)
        .post('/roast-profiles')
        .set('Authorization', `Bearer ${stockistToken}`)
        .send({
          name: 'Unauthorized Profile',
          charge_temp: 200,
          development_time_sec: 100,
          drop_temp: 210,
        });
      expect(resProfile.status).toBe(403);

      const resRoast = await request(app)
        .post('/roast-batches')
        .set('Authorization', `Bearer ${stockistToken}`)
        .send({
          batch_code: 'UNAUTHORIZED-ROAST',
          green_bean_batch_id: 'green-01',
          roast_profile_id: 'profile-01',
          initial_weight_kg: 5,
          final_weight_kg: 4.2,
        });
      expect(resRoast.status).toBe(403);
    });

    test('Roast Master cannot add green bean stock or SKUs', async () => {
      const resGreen = await request(app)
        .post('/green-beans')
        .set('Authorization', `Bearer ${roasterToken}`)
        .send({
          batch_code: 'UNAUTH-GREEN',
          origin_id: 'origin-01',
          variety: 'Geisha',
          process_method: 'Natural',
          harvest_year: '2026',
          moisture_pct: 11,
          initial_quantity_kg: 10,
          cost_per_kg: 100,
        });
      expect(resGreen.status).toBe(403);
    });

    test('Admin has full access to all operations', async () => {
      const resOrigin = await request(app)
        .post('/origins')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Fazenda Santa Inês',
          producer: 'Francisco Isidro',
          region: 'Carmo de Minas',
          farm_name: 'Santa Inês',
          altitude: 1100,
        });
      expect(resOrigin.status).toBe(201);
    });
  });
});
