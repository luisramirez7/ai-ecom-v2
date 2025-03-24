import { prisma } from "@/lib/prisma";
import type { Product, Category } from "@prisma/client";
import { ProductDetails } from "@/components/ProductDetails";

type ProductWithCategory = Omit<Product, 'price'> & {
  price: number;
  category: Category | null;
};

async function getProduct(id: string): Promise<ProductWithCategory | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      }
    });

    if (!product) return null;

    // Convert Decimal price to number
    return {
      ...product,
      price: Number(product.price)
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  // Await the params before using them
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <p>Sorry, we couldn't find the product you're looking for.</p>
      </div>
    );
  }

  return <ProductDetails product={product} />;
} 