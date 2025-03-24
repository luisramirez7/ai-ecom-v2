const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  // Create the Mounts category
  const mountsCategory = await prisma.category.upsert({
    where: { id: 'mounts' },
    update: {},
    create: {
      id: 'mounts',
      name: 'Mounts',
      description: 'Bike mounting accessories',
    },
  });

  // Create products
  const products = [
    {
      id: randomUUID(),
      name: 'Universal Bike Mount',
      description: 'Fits all share bikes and personal bicycles with adjustable grip',
      price: 24.99,
      inventory: 100,
      imageUrl: '/product-placeholder.jpg',
      categoryId: mountsCategory.id,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      name: 'Premium Waterproof Mount',
      description: 'Waterproof and shock-resistant for all weather conditions',
      price: 39.99,
      inventory: 50,
      imageUrl: '/product-placeholder.jpg',
      categoryId: mountsCategory.id,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      name: 'Quick-Release Bike Mount',
      description: 'Easy to attach and detach with secure locking mechanism',
      price: 29.99,
      inventory: 75,
      imageUrl: '/product-placeholder.jpg',
      categoryId: mountsCategory.id,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 