import { prisma } from "../lib/prisma";

async function createMockOrder() {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: "luisramirez.hello@gmail.com"
      }
    });

    if (!user) {
      console.error("User not found");
      return;
    }

    // Get a random product for the order
    const product = await prisma.product.findFirst();

    if (!product) {
      console.error("No products found in database");
      return;
    }

    // Create a mock order
    const order = await prisma.order.create({
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
              productId: product.id,
              quantity: 1,
              price: 89.99
            }
          ]
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    console.log("Mock order created:", order);
  } catch (error) {
    console.error("Error creating mock order:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createMockOrder(); 