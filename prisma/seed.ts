import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  const customers = await prisma.customer.createMany({
    data: [
      {
        name: 'Acme Metal S.A.',
        email: 'compras@acmemetal.com',
        phone: '+56 2 2222 1111',
        taxId: '76.123.456-7',
        address: 'Av. Industrial 1200, Santiago',
        status: 'ACTIVE',
        createdById: admin.id,
      },
      {
        name: 'Grupo Norte Ltda.',
        email: 'pedidos@gruponorte.cl',
        phone: '+56 9 3333 4444',
        taxId: '76.654.321-8',
        address: 'Calle Fábrica 45, Concepción',
        status: 'ACTIVE',
        createdById: admin.id,
      },
      {
        name: 'Industrial Sur SPA',
        email: 'operaciones@industrialsur.cl',
        phone: '+56 9 5555 6666',
        taxId: '76.987.654-9',
        address: 'Ruta 5 Norte km 30, Talca',
        status: 'ACTIVE',
        createdById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  const categories = await prisma.category.createMany({
    data: [
      { name: 'Herramientas', description: 'Equipos y herramientas de mantenimiento' },
      { name: 'Mecánica', description: 'Repuestos y componentes industriales' },
      { name: 'Seguridad', description: 'Elementos de protección y seguridad' },
    ],
    skipDuplicates: true,
  });

  const products = [
    { sku: 'MTL-001', name: 'Taladro industrial', description: 'Taladro de 20V para uso continuo', price: 129000, stock: 24, categoryName: 'Herramientas' },
    { sku: 'MTL-002', name: 'Sensor de presión', description: 'Sensor para líneas de producción', price: 89000, stock: 7, categoryName: 'Mecánica' },
    { sku: 'MTL-003', name: 'Guantes de seguridad', description: 'Guantes resistentes para operación', price: 18000, stock: 45, categoryName: 'Seguridad' },
    { sku: 'MTL-004', name: 'Correa transportadora', description: 'Correa para flujo de material', price: 245000, stock: 3, categoryName: 'Mecánica' },
    { sku: 'MTL-005', name: 'Estación de carga', description: 'Carga para baterías de herramientas', price: 99000, stock: 12, categoryName: 'Herramientas' },
  ];

  for (const product of products) {
    const category = await prisma.category.findUnique({ where: { name: product.categoryName } });
    if (!category) continue;

    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: {
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: category.id,
      },
    });
  }

  console.log('Seed completed');
  console.log({ admin: admin.email, customers, categories });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
