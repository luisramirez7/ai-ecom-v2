import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-6 mb-12">
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-muted-foreground text-lg">
            Browse our collection of high-quality phone mounts for share bikes
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product: Product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              price={Number(product.price)}
              imageUrl={product.imageUrl ?? "/product-placeholder.jpg"}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 