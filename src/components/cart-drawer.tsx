"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, refetchCart } = useCart();
  const [loading, setLoading] = useState<string | null>(null);

  const subtotal = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const totalQuantity = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (loading) return; // Prevent multiple simultaneous updates
    setLoading(id);
    
    try {
      if (newQuantity === 0) {
        await removeItem(id);
        toast.success("Item removed from cart");
      } else {
        const success = await updateQuantity(id, newQuantity);
        if (!success) {
          toast.error("Failed to update quantity. Not enough inventory.");
          return;
        }
      }
    } catch (error) {
      toast.error("Failed to update quantity");
      console.error("Error updating quantity:", error);
    } finally {
      // Remove loading state after a short delay to prevent button flicker
      await new Promise(resolve => setTimeout(resolve, 300));
      setLoading(null);
    }
  };

  useEffect(() => {
    if (open) {
      refetchCart();
    }
  }, [open, refetchCart]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed inset-y-0 right-0 flex w-full flex-col bg-white p-6 shadow-lg animate-in slide-in-from-right duration-300 md:w-[400px] dark:bg-gray-950" aria-describedby="cart-description">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">My Cart ({totalQuantity})</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-auto w-auto p-0">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          
          <div id="cart-description" className="sr-only">Cart containing your selected items for purchase</div>
          
          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product_id} className="flex gap-4">
                    <div className="relative aspect-square h-20 w-20 min-w-[80px] overflow-hidden rounded-lg">
                      <Image
                        src={item.imageUrl || "/images/placeholder-1.jpg"}
                        alt={item.name}
                        sizes="80px"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                          disabled={loading === item.product_id}
                          aria-label={item.quantity === 1 ? `Remove ${item.name} from cart` : `Decrease ${item.name} quantity`}
                        >
                          {loading === item.product_id 
                            ? "..." 
                            : item.quantity === 1 
                              ? <Trash2 className="h-3 w-3" /> 
                              : <Minus className="h-3 w-3" />
                          }
                        </Button>
                        <span className="text-sm font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 rounded-full"
                          onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                          disabled={loading === item.product_id || item.inventory <= item.quantity}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          {loading === item.product_id ? "..." : <Plus className="h-3 w-3" />}
                        </Button>
                      </div>
                      <p className="text-sm font-medium mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-sm mb-4">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 dark:text-gray-400">
              Shipping and taxes calculated at checkout
            </p>
            <div className="space-y-3">
              <Link href="/cart" className="block w-full">
                <Button className="w-full" variant="outline" onClick={() => onOpenChange(false)}>
                  View Cart
                </Button>
              </Link>
              <Link href="/cart" className="block w-full">
                <Button className="w-full" onClick={() => onOpenChange(false)}>
                  Checkout
                </Button>
              </Link>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 