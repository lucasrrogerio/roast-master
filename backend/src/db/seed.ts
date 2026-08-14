import { prisma } from './index';
import bcrypt from 'bcrypt';

export async function seedDatabase() {
  console.log('🌱 Seeding database with Prisma ORM...');

  // 1. Users
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const roasterPassword = bcrypt.hashSync('roaster123', 10);
  const stockistPassword = bcrypt.hashSync('stock123', 10);

  const adminId = 'user-admin-01';
  const roasterId = 'user-roaster-01';
  const stockistId = 'user-stockist-01';

  await prisma.user.upsert({
    where: { id: adminId },
    update: {},
    create: {
      id: adminId,
      name: 'Carlos Administrador',
      email: 'admin@roastmaster.com',
      password_hash: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { id: roasterId },
    update: {},
    create: {
      id: roasterId,
      name: 'Mariana Mestre de Torra',
      email: 'mestre@roastmaster.com',
      password_hash: roasterPassword,
      role: 'ROAST_MASTER',
    },
  });

  await prisma.user.upsert({
    where: { id: stockistId },
    update: {},
    create: {
      id: stockistId,
      name: 'Pedro Estoquista',
      email: 'estoque@roastmaster.com',
      password_hash: stockistPassword,
      role: 'STOCKIST',
    },
  });

  // 2. Origins
  const origin1Id = 'origin-01';
  const origin2Id = 'origin-02';

  await prisma.origin.upsert({
    where: { id: origin1Id },
    update: {},
    create: {
      id: origin1Id,
      name: 'Fazenda Sertão - Sul de Minas',
      producer: 'Nazareth Dias Pereira',
      region: 'Carmo de Minas, MG',
      farm_name: 'Fazenda Sertão',
      altitude: 1250,
    },
  });

  await prisma.origin.upsert({
    where: { id: origin2Id },
    update: {},
    create: {
      id: origin2Id,
      name: 'Sítio Canaã - Matas de Minas',
      producer: 'Sebastião Alves',
      region: 'Araponga, MG',
      farm_name: 'Sítio Canaã',
      altitude: 1300,
    },
  });

  // 3. Green Bean Batches (1 saca = ~60kg)
  const green1Id = 'green-01';
  const green2Id = 'green-02';

  await prisma.greenBeanBatch.upsert({
    where: { id: green1Id },
    update: { current_quantity_kg: 60.0 },
    create: {
      id: green1Id,
      batch_code: 'GV-2026-001',
      origin_id: origin1Id,
      variety: 'Bourbon Amarelo',
      process_method: 'Natural',
      harvest_year: '2025/2026',
      moisture_pct: 11.2,
      sca_score: 86.5,
      initial_quantity_kg: 60.0,
      current_quantity_kg: 60.0,
      cost_per_kg: 48.50,
      notes: 'Grão de alta doçura e notas de caramelo',
    },
  });

  await prisma.greenBeanBatch.upsert({
    where: { id: green2Id },
    update: { current_quantity_kg: 120.0 },
    create: {
      id: green2Id,
      batch_code: 'GV-2026-002',
      origin_id: origin2Id,
      variety: 'Catuaí Vermelho',
      process_method: 'Lavado',
      harvest_year: '2025/2026',
      moisture_pct: 10.8,
      sca_score: 84.0,
      initial_quantity_kg: 120.0,
      current_quantity_kg: 120.0,
      cost_per_kg: 39.00,
      notes: 'Acidez cítrica vibrante e corpo médio',
    },
  });

  // 4. Roast Profiles
  const profile1Id = 'profile-01';
  const profile2Id = 'profile-02';

  await prisma.roastProfile.upsert({
    where: { id: profile1Id },
    update: {},
    create: {
      id: profile1Id,
      name: 'Mantiqueira Filtrado Especial',
      target_bean_variety: 'Bourbon Amarelo',
      charge_temp: 195.0,
      development_time_sec: 110,
      drop_temp: 206.5,
      target_agtron: 65,
      flavor_notes: 'Frutas amarelas, caramelo e finalização sedosa',
    },
  });

  await prisma.roastProfile.upsert({
    where: { id: profile2Id },
    update: {},
    create: {
      id: profile2Id,
      name: 'Espresso Intenso Chocolate',
      target_bean_variety: 'Catuaí Vermelho',
      charge_temp: 205.0,
      development_time_sec: 135,
      drop_temp: 214.0,
      target_agtron: 50,
      flavor_notes: 'Chocolate meio amargo, avelã e crema densa',
    },
  });

  // 5. Product SKUs
  const sku1Id = 'sku-01';
  const sku2Id = 'sku-02';

  await prisma.productSku.upsert({
    where: { id: sku1Id },
    update: { current_stock_units: 0 },
    create: {
      id: sku1Id,
      sku_code: 'PROD-250G-BOURBON',
      name: 'Bourbon Amarelo Especial 250g',
      package_weight_g: 250.0,
      description: 'Pacote com válvula desgaseificadora e zíper',
      price: 38.00,
      current_stock_units: 0,
    },
  });

  await prisma.productSku.upsert({
    where: { id: sku2Id },
    update: { current_stock_units: 0 },
    create: {
      id: sku2Id,
      sku_code: 'PROD-1KG-ESPRESSO',
      name: 'Espresso Chocolate Intenso 1Kg',
      package_weight_g: 1000.0,
      description: 'Pacote em grãos de 1Kg para cafeterias parceiras',
      price: 120.00,
      current_stock_units: 0,
    },
  });

  console.log('✅ Database seeded successfully with Prisma!');
}

if (require.main === module) {
  seedDatabase()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
