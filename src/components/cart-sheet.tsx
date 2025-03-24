"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, Plus, Minus, Trash2, Loader2, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, updateQuantity, removeItem, refetchCart } = useCart();
  const [loading, setLoading] = useState<string | null>(null);

  const subtotal = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

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

  useEffect(() => {
    if (open) {
      refetchCart();
    }
  }, [open, refetchCart]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-6">
        <SheetHeader className="px-0">
          <div className="flex items-center justify-between">
            <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6 px-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">
                  Add items to your cart to see them here
                </p>
              </div>
              <Button onClick={() => onOpenChange(false)} asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-4">
                  <div className="relative aspect-square h-20 w-20 min-w-[80px] overflow-hidden rounded-lg">
                    <Image
                      src={item.imageUrl || "/images/placeholder-1.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-medium leading-none">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.product_id, Math.max(0, item.quantity - 1))}
                        disabled={loading === item.product_id}
                      >
                        {loading === item.product_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : item.quantity === 1 ? (
                          <Trash2 className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                      </Button>
                      <span className="text-sm font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                        disabled={loading === item.product_id || item.inventory <= item.quantity}
                      >
                        {loading === item.product_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {item.inventory <= 5 && item.inventory > 0 && (
                      <p className="text-xs text-orange-500">
                        Only {item.inventory} left
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-6 pb-2 space-y-6 px-0">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="space-y-3">
              <Button asChild className="w-full" onClick={() => onOpenChange(false)}>
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button className="w-full" variant="outline" onClick={() => onOpenChange(false)}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
} 