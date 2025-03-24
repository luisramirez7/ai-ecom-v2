"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CartSummary() {
  const { items } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  const subtotal = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const shippingCost = subtotal > 0 ? 79 : 0; // Example shipping cost
  const total = subtotal + shippingCost;

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-semibold">Order Summary</h3>
      <div className="mt-4 space-y-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{subtotal > 0 ? formatPrice(shippingCost) : "Calculated at checkout"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Estimated Tax</span>
          <span>Calculated at checkout</span>
        </div>

        <Collapsible open={isPromoOpen} onOpenChange={setIsPromoOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="link" className="h-auto p-0 text-sm">
              {isPromoOpen ? "Hide promo code" : "Apply Promo Code"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button variant="secondary" size="sm" className="shrink-0">
                Apply
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="border-t pt-4">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
      <Button
        className="w-full mt-6"
        onClick={handleCheckout}
        disabled={isLoading || items.length === 0}
      >
        {isLoading ? "Processing..." : "Checkout"}
      </Button>
    </div>
  );
} 