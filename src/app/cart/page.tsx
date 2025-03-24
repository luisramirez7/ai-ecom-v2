"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { CartSummary } from "@/components/cart-summary";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, refetchCart } = useCart();
  const [loading, setLoading] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCart = async () => {
      try {
        await refetchCart();
      } catch (err) {
        setError("Failed to load cart items. Please try refreshing the page.");
        toast.error("Failed to load cart items");
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadCart();
  }, [refetchCart]);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    setLoading(id);
    try {
      if (newQuantity === 0) {
        await removeItem(id);
        await refetchCart();
        toast.success("Item removed from cart");
      } else {
        const success = await updateQuantity(id, newQuantity);
        if (!success) {
          toast.error("Failed to update quantity. Not enough inventory.");
        } else {
          await refetchCart();
        }
      }
    } catch (error) {
      toast.error("Failed to update quantity");
      console.error("Error updating quantity:", error);
    } finally {
      setTimeout(() => setLoading(null), 300);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="container px-4 py-16 md:px-6 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-16 md:px-6">
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container px-4 py-16 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col items-start gap-4">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-gray-500">Your cart is empty</p>
            <Link href="/products">
              <Button className="mt-4">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
          <div className="lg:sticky lg:top-8">
            <CartSummary />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-16 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <Link href="/products">
              <Button variant="outline">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex gap-4 items-start p-4 bg-white rounded-lg shadow dark:bg-gray-800"
              >
                <div className="relative aspect-square h-24 w-24 min-w-[96px] overflow-hidden rounded-md">
                  <Image
                    src={item.imageUrl || "/images/placeholder-1.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(item.product_id, Math.max(0, item.quantity - 1))}
                      disabled={loading === item.product_id}
                      aria-label={item.quantity === 1 ? `Remove ${item.name} from cart` : `Decrease ${item.name} quantity`}
                    >
                      {loading === item.product_id 
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : item.quantity === 1 
                          ? <Trash2 className="h-3 w-3" /> 
                          : "-"
                      }
                    </Button>
                    <span className="min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                      disabled={loading === item.product_id || item.inventory <= item.quantity}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      {loading === item.product_id 
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : "+"
                      }
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateQuantity(item.product_id, 0)}
                      disabled={loading === item.product_id}
                    >
                      {loading === item.product_id 
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : "Remove"
                      }
                    </Button>
                  </div>
                  {item.inventory <= 5 && item.inventory > 0 && (
                    <p className="text-sm text-orange-500">
                      Only {item.inventory} left in stock
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:sticky lg:top-8">
          <CartSummary />
        </div>
      </div>
    </div>
  );
} 