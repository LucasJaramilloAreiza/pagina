import { PrismaClient, Role, CustomerStatus, ItemType, ItemUnit } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ==========================================
  // 1. USUARIOS
  // ==========================================
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pagina.local' },
    update: {},
    create: {
      email: 'admin@pagina.local',
      name: 'Sofía Torres',
      passwordHash: 'demo-hash-admin',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // ==========================================
  // 2. CLIENTES
  // ==========================================
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'Aromas del Valle S.A.',
        email: 'contacto@aromasdelvalle.com',
        phone: '+56 2 2222 1111',
        taxId: '76.123.456-7',
        address: 'Camino de los Aromas 1200, Santiago',
        status: CustomerStatus.ACTIVE, // Ahora usa el Enum nativo
        createdById: admin.id,
      },
      {
        name: 'Hierbas de la Araucanía Ltda.',
        email: 'pedidos@hierbasaraucania.cl',
        phone: '+56 9 3333 4444',
        taxId: '76.654.321-8',
        address: 'Ruta del Bosque 45, Villarrica',
        status: CustomerStatus.ACTIVE,
        createdById: admin.id,
      },
      {
        name: 'Esencias Puras SPA',
        email: 'ventas@esenciaspuras.cl',
        phone: '+56 9 5555 6666',
        taxId: '76.987.654-9',
        address: 'Av. Natural 300, Valdivia',
        status: CustomerStatus.ACTIVE,
        createdById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  // ==========================================
  // 3. CATEGORÍAS
  // ==========================================
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Natural/Hierbas', description: 'Ingredientes botánicos y bases naturales' },
      { name: 'Aromas/Esencia', description: 'Esencias aromáticas puras para jabones' },
      { name: 'Aromas/Aceite', description: 'Aceites esenciales para fragancias premium' },
      { name: 'Natural/Base', description: 'Bases de jabón y mantecas naturales' },
      { name: 'Natural/Exfoliante', description: 'Ingredientes exfoliantes naturales' },
    ],
    skipDuplicates: true,
  });

  // ==========================================
  // 4. ESTACIONES DE PRODUCCIÓN
  // ==========================================
  await prisma.productionStation.upsert({
    where: { name: 'Área de Mezclado' },
    update: {},
    create: { 
      name: 'Área de Mezclado', 
      description: 'Donde ocurre la mezcla química e infusión de esencias.' 
    },
  });

  await prisma.productionStation.upsert({
    where: { name: 'Área de Empaque' },
    update: {},
    create: { 
      name: 'Área de Empaque', 
      description: 'Donde se cortan, etiquetan y empaquetan los jabones.' 
    },
  });

  // ==========================================
  // 5. INVENTARIO UNIFICADO (Insumos y Terminados)
  // ==========================================
  const inventoryItems = [
    { sku: 'JAB-LAV-01', name: 'Jabón de Lavanda Artesanal', type: ItemType.FINISHED, unit: ItemUnit.UNIT, stock: 24, categoryName: 'Natural/Hierbas' },
    { sku: 'EUC-ESS-01', name: 'Esencia de Eucalipto', type: ItemType.RAW_MATERIAL, unit: ItemUnit.LITER, stock: 40, categoryName: 'Aromas/Esencia' },
    { sku: 'TEG-ESS-01', name: 'Aceite Esencial de Té Verde', type: ItemType.RAW_MATERIAL, unit: ItemUnit.LITER, stock: 30, categoryName: 'Aromas/Aceite' },
    { sku: 'KAR-BASE-01', name: 'Jabón de Manteca de Karité', type: ItemType.FINISHED, unit: ItemUnit.UNIT, stock: 18, categoryName: 'Natural/Base' },
    { sku: 'CAF-EXF-01', name: 'Jabón Exfoliante de Café', type: ItemType.FINISHED, unit: ItemUnit.UNIT, stock: 12, categoryName: 'Natural/Exfoliante' },
  ];

  for (const item of inventoryItems) {
    const category = await prisma.category.findUnique({ where: { name: item.categoryName } });
    if (!category) continue;

    await prisma.inventoryItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        sku: item.sku,
        name: item.name,
        type: item.type,
        unit: item.unit,
        stock: item.stock,
        categoryId: category.id,
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log({ admin: admin.email, customers: 'Loaded', categories: 'Loaded', inventory: 'Loaded' });
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });