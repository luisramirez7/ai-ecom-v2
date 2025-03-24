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

  // Find the user
  const user = await prisma.user.findUnique({
    where: {
      email: "luisramirez.hello@gmail.com"
    }
  });

  if (!user) {
    console.log("User not found, skipping order creation");
    return;
  }

  // Get the first product for the mock order
  const firstProduct = await prisma.product.findFirst();
  
  if (!firstProduct) {
    console.log("No products found, skipping order creation");
    return;
  }

  // Create a mock order for the user
  const mockOrder = await prisma.order.create({
    data: {
      userId: user.id,
      status: "PENDING",
      total: 99.99,
      customerEmail: user.email,
      customerName: user.name || "Luis Ramirez",
      shippingAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
        country: "Test Country"
      },
      shippingMethod: "standard",
      shippingCost: 9.99,
      items: {
        create: [
          {
            productId: firstProduct.id,
            quantity: 1,
            price: 89.99
          }
        ]
      }
    }
  });

  console.log("Created mock order:", mockOrder);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 