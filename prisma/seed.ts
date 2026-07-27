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
        name: 'Aromas del Valle S.A.',
        email: 'contacto@aromasdelvalle.com',
        phone: '+56 2 2222 1111',
        taxId: '76.123.456-7',
        address: 'Camino de los Aromas 1200, Santiago',
        status: 'ACTIVE',
        createdById: admin.id,
      },
      {
        name: 'Hierbas de la Araucanía Ltda.',
        email: 'pedidos@hierbasaraucania.cl',
        phone: '+56 9 3333 4444',
        taxId: '76.654.321-8',
        address: 'Ruta del Bosque 45, Villarrica',
        status: 'ACTIVE',
        createdById: admin.id,
      },
      {
        name: 'Esencias Puras SPA',
        email: 'ventas@esenciaspuras.cl',
        phone: '+56 9 5555 6666',
        taxId: '76.987.654-9',
        address: 'Av. Natural 300, Valdivia',
        status: 'ACTIVE',
        createdById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

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

  const products = [
    { sku: 'JAB-LAV-01', name: 'Jabón de Lavanda Artesanal', description: 'Jabón suave con infusión de lavanda y extractos botánicos.', price: 12900, stock: 24, categoryName: 'Natural/Hierbas' },
    { sku: 'EUC-ESS-01', name: 'Esencia de Eucalipto (ml)', description: 'Esencia fresca de eucalipto para jabones aromáticos.', price: 8500, stock: 40, categoryName: 'Aromas/Esencia' },
    { sku: 'TEG-ESS-01', name: 'Aceite Esencial de Té Verde (ml)', description: 'Aceite esencial premium para jabones revitalizantes.', price: 9800, stock: 30, categoryName: 'Aromas/Aceite' },
    { sku: 'KAR-BASE-01', name: 'Jabón de Manteca de Karité', description: 'Jabón nutritivo con manteca de karité para piel seca.', price: 14500, stock: 18, categoryName: 'Natural/Base' },
    { sku: 'CAF-EXF-01', name: 'Jabón Exfoliante de Café', description: 'Jabón energizante con partículas de café natural.', price: 13900, stock: 12, categoryName: 'Natural/Exfoliante' },
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
