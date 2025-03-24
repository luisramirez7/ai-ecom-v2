"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { CartItem, CartContextType } from "@/types/cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  // Get initial cart data
  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }
      
      const cartItems = await response.json();
      
      if (!Array.isArray(cartItems)) {
        console.error('Invalid cart items format:', cartItems);
        setItems([]);
        return;
      }

      // Group items by product_id and combine quantities
      const groupedItems: Record<string, CartItem> = {};
      
      cartItems.forEach((item: any) => {
        if (!item?.product_id || !item?.products) {
          console.warn('Invalid cart item format:', item);
          return;
        }

        if (groupedItems[item.product_id]) {
          groupedItems[item.product_id].quantity += item.quantity;
        } else {
          groupedItems[item.product_id] = {
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            name: item.products.name,
            price: Number(item.products.price),
            imageUrl: item.products.image_url || undefined,
            inventory: item.products.inventory
          };
        }
      });
      
      setItems(Object.values(groupedItems));
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart items');
      setItems([]);
    }
  }, []);

  // Initial fetch only
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateInventory = async (productId: string, quantity: number, action: "decrease" | "increase") => {
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update inventory: ${errorData.error || response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("Error updating inventory:", error);
      return false;
    }
  };

  const scheduleFetch = () => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    // Schedule a new fetch after 500ms
    fetchTimeoutRef.current = setTimeout(fetchCart, 500);
  };

  const addItem = async (newItem: CartItem) => {
    try {
      const success = await updateInventory(newItem.product_id, 1, "decrease");
      if (!success) return false;

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: newItem.product_id,
          quantity: 1
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      scheduleFetch();
      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      await updateInventory(newItem.product_id, 1, "increase");
      toast.error('Failed to add item to cart');
      return false;
    }
  };

  const createOrder = async () => {
    try {
      if (items.length === 0) {
        toast.error('Your cart is empty');
        return null;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: items
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      setItems([]); // Clear cart after successful order creation
      toast.success('Order created successfully!');
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
      return null;
    }
  };

  const removeItem = async (id: string) => {
    try {
      const item = items.find((item) => item.product_id === id);
      if (item) {
        await updateInventory(id, item.quantity, "increase");
        
        const response = await fetch(`/api/cart/${item.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error('Failed to remove item from cart');
        }

        scheduleFetch();
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    try {
      const item = items.find((item) => item.product_id === id);
      if (!item) return false;

      const quantityDiff = newQuantity - item.quantity;
      if (quantityDiff === 0) return true;

      const action = quantityDiff > 0 ? "decrease" : "increase";
      const success = await updateInventory(id, Math.abs(quantityDiff), action);
      if (!success) return false;

      if (newQuantity === 0) {
        const response = await fetch(`/api/cart/${item.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error('Failed to remove item from cart');
        }
      } else {
        const response = await fetch(`/api/cart/${item.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newQuantity }),
        });

        if (!response.ok) {
          throw new Error('Failed to update quantity');
        }
      }

      scheduleFetch();
      return true;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      toast.error('Failed to update quantity');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      for (const item of items) {
        await updateInventory(item.product_id, item.quantity, "increase");
      }

      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      scheduleFetch();
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, refetchCart: fetchCart, createOrder }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
} 