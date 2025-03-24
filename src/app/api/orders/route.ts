import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateShipping } from "@/lib/shipping";
import { formatStripePrice } from "@/lib/stripe";
import type { ShippingAddress } from "@/lib/shipping";
import * as jose from 'jose';
import { cookies } from 'next/headers';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Get all orders (protected route)
export async function GET(request: Request) {
  try {
    console.log('GET /api/orders - Fetching orders');
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      console.log('No token found');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    console.log('Token verified, userId:', payload.userId);
    
    const orders = await prisma.order.findMany({
      where: { userId: payload.userId as string },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    console.log('Found orders:', orders.length);

    // Convert Decimal fields to regular numbers for JSON serialization
    const serializedOrders = orders.map(order => ({
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
    }));

    console.log('Returning serialized orders');
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

    let userId: string | undefined;

    // Get token from cookie
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    // If token exists, verify it and get user ID
    if (token) {
      try {
        const { payload } = await jose.jwtVerify(token, JWT_SECRET);
        userId = payload.userId as string;
      } catch (error) {
        console.error("Invalid token:", error);
        // Continue with guest checkout if token is invalid
      }
    }

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
          userId, // Will be null for guest users
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