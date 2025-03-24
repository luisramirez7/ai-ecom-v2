import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateShipping } from "@/lib/shipping";
import { formatStripePrice } from "@/lib/stripe";
import type { ShippingAddress } from "@/lib/shipping";

// Get all orders
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Convert Decimal fields to regular numbers for JSON serialization
    const serializedOrders = orders.map(order => ({
      ...order,
      total: Number(order.total),
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
        product: item.product ? {
          ...item.product,
          price: Number(item.product.price)
        } : null
      }))
    }));

    return NextResponse.json(serializedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// Create a new order
export async function POST(request: Request) {
  try {
    const { 
      cartItems,
      customerEmail,
      customerName,
      shippingAddress,
      shippingMethod
    } = await request.json();

    if (!cartItems?.length || !customerEmail || !customerName || !shippingAddress || !shippingMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate subtotal from cart items
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate shipping cost
    const shippingCost = calculateShipping(cartItems, shippingMethod);
    
    // Calculate total including shipping
    const total = subtotal + shippingCost;

    // Create order and order items in a transaction
    const order = await prisma.$transaction(async (prisma) => {
      // Create the order
      const newOrder = await prisma.order.create({
        data: {
          total,
          status: "PENDING",
          customerEmail,
          customerName,
          shippingAddress,
          shippingMethod,
          shippingCost,
          items: {
            create: cartItems.map(item => ({
              productId: item.product_id,
              quantity: item.quantity,
              price: item.price
            }))
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

      // Clear cart items
      for (const item of cartItems) {
        await prisma.cartItem.delete({
          where: { id: item.id }
        });
      }

      return newOrder;
    });

    // Convert Decimal fields for JSON serialization
    const serializedOrder = {
      ...order,
      total: Number(order.total),
      shippingCost: Number(order.shippingCost),
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
        product: item.product ? {
          ...item.product,
          price: Number(item.product.price)
        } : null
      }))
    };

    // Create Stripe payment intent
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: formatStripePrice(total),
        orderId: order.id,
        shippingAddress
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const { clientSecret } = await response.json();

    return NextResponse.json({
      order: serializedOrder,
      paymentIntent: clientSecret
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
} 