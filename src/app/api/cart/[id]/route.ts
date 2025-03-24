import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { quantity } = body;

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

    return NextResponse.json(updatedCartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
} 