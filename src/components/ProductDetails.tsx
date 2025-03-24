"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { type products } from "@prisma/client";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { toast } from "sonner";
import { CartSheet } from "@/components/cart-sheet";
import { Loader2 } from "lucide-react";

interface ProductDetailsProps {
  product: products & {
    category: { id: string; name: string } | null;
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const success = await addItem({
        id: crypto.randomUUID(),
        product_id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        imageUrl: product.image_url ?? undefined,
        inventory: product.inventory,
      });

      if (success) {
        setIsCartOpen(true);
        toast.success("Added to cart");
      } else {
        toast.error("Failed to add to cart. Not enough inventory.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
              <Image
                src={product.image_url ?? "/product-placeholder.jpg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <p className="text-2xl font-semibold">${Number(product.price).toFixed(2)}</p>
                {product.category && (
                  <p className="text-sm text-muted-foreground">Category: {product.category.name}</p>
                )}
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
              
              <div className="pt-4 space-y-4">
                {product.inventory > 0 ? (
                  <>
                    <p className="text-sm">
                      {product.inventory <= 5 ? (
                        <span className="text-orange-500">
                          Only {product.inventory} left in stock - order soon
                        </span>
                      ) : (
                        <span className="text-green-600">In Stock</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        className="w-full sm:w-auto" 
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add to Cart"
                        )}
                      </Button>
                      <Button variant="outline" className="w-full sm:w-auto" size="lg">
                        Buy Now
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-destructive font-medium">Out of Stock</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
} 