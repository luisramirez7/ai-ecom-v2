import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received inventory update request:', body);
    
    const { productId, quantity, action } = body;

    if (!productId || !quantity || !action) {
      console.error('Missing required fields:', { productId, quantity, action });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action !== "increase" && action !== "decrease") {
      console.error('Invalid action:', action);
      return NextResponse.json(
        { error: "Invalid action. Must be 'increase' or 'decrease'" },
        { status: 400 }
      );
    }

    console.log('Fetching current product inventory...');
    // Get current inventory
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, inventory: true }
    });

    if (!product) {
      console.error("Product not found:", productId);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    console.log('Current product state:', product);

    // Calculate new inventory
    const newInventory = action === "decrease" 
      ? product.inventory - quantity
      : product.inventory + quantity;

    console.log('Calculated new inventory:', {
      currentInventory: product.inventory,
      quantity,
      action,
      newInventory
    });

    // Check if we have enough inventory
    if (newInventory < 0) {
      console.error('Not enough inventory:', {
        currentInventory: product.inventory,
        requested: quantity,
        action
      });
      return NextResponse.json(
        { error: "Not enough inventory" },
        { status: 400 }
      );
    }

    console.log('Updating inventory in database...');
    // Update inventory
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { inventory: newInventory },
      select: { id: true, inventory: true }
    });

    console.log('Inventory update successful');
    return NextResponse.json({ 
      success: true,
      newInventory: updatedProduct.inventory,
      productId: updatedProduct.id
    });
  } catch (error) {
    console.error("Error processing inventory update:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
} 