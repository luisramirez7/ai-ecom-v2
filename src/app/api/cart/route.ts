import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const cartItems = await prisma.cartItem.findMany({
      include: {
        product: true,
      },
    });

    // Convert Decimal fields to regular numbers for JSON serialization
    const serializedCartItems = cartItems.map(item => ({
      ...item,
      products: item.product ? {
        ...item.product,
        price: item.product.price ? Number(item.product.price) : null,
        created_at: item.product.createdAt.toISOString(),
        updated_at: item.product.updatedAt.toISOString()
      } : null
    }));

    return NextResponse.json(serializedCartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { product_id, quantity } = await request.json();

    // Check if product exists and has enough inventory
    const product = await prisma.product.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.inventory < quantity) {
      return NextResponse.json(
        { error: "Not enough inventory" },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        product_id,
      },
    });

    if (existingCartItem) {
      // Update existing cart item and inventory in a transaction
      const newQuantity = existingCartItem.quantity + quantity;
      const [updatedCartItem] = await prisma.$transaction([
        prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: newQuantity },
          include: {
            product: true,
          },
        }),
        prisma.product.update({
          where: { id: product_id },
          data: {
            inventory: {
              decrement: quantity,
            },
          },
        }),
      ]);

      return NextResponse.json({
        ...updatedCartItem,
        products: updatedCartItem.product ? {
          ...updatedCartItem.product,
          price: Number(updatedCartItem.product.price),
          created_at: updatedCartItem.product.createdAt.toISOString(),
          updated_at: updatedCartItem.product.updatedAt.toISOString()
        } : null
      });
    }

    // Create new cart item and update inventory in a transaction
    const [newCartItem] = await prisma.$transaction([
      prisma.cartItem.create({
        data: {
          id: randomUUID(),
          product_id,
          quantity,
        },
        include: {
          product: true,
        },
      }),
      prisma.product.update({
        where: { id: product_id },
        data: {
          inventory: {
            decrement: quantity,
          },
        },
      }),
    ]);

    return NextResponse.json({
      ...newCartItem,
      products: newCartItem.product ? {
        ...newCartItem.product,
        price: Number(newCartItem.product.price),
        created_at: newCartItem.product.createdAt.toISOString(),
        updated_at: newCartItem.product.updatedAt.toISOString()
      } : null
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get the cart item to restore inventory
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Delete cart item and restore inventory in a transaction
    await prisma.$transaction([
      prisma.cartItem.delete({
        where: { id },
      }),
      prisma.product.update({
        where: { id: cartItem.product_id },
        data: {
          inventory: {
            increment: cartItem.quantity,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    const body = await request.json();
    const { quantity } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get the current cart item
    const currentCartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!currentCartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    const quantityDiff = quantity - currentCartItem.quantity;

    // Check if we have enough inventory for the increase
    if (quantityDiff > 0 && currentCartItem.product.inventory < quantityDiff) {
      return NextResponse.json(
        { error: "Not enough inventory" },
        { status: 400 }
      );
    }

    // Update cart item and inventory in a transaction
    const [updatedCartItem] = await prisma.$transaction([
      prisma.cartItem.update({
        where: { id },
        data: { quantity },
        include: {
          product: true,
        },
      }),
      prisma.product.update({
        where: { id: currentCartItem.product_id },
        data: {
          inventory: {
            decrement: quantityDiff,
          },
        },
      }),
    ]);

    return NextResponse.json({
      ...updatedCartItem,
      products: updatedCartItem.product ? {
        ...updatedCartItem.product,
        price: Number(updatedCartItem.product.price),
        created_at: updatedCartItem.product.createdAt.toISOString(),
        updated_at: updatedCartItem.product.updatedAt.toISOString()
      } : null
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
} 