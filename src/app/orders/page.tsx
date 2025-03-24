"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string;
  } | null;
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      console.log("Fetching orders, user:", user?.email);
      if (!user) {
        console.log("No user found, skipping fetch");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Making fetch request to /api/orders");
        const response = await fetch("/api/orders", {
          credentials: 'include',
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log("Unauthorized, redirecting to login");
            router.push('/login');
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          console.error("Error response:", errorData);
          throw new Error(errorData.error || "Failed to fetch orders");
        }

        const data = await response.json();
        console.log("Fetched orders:", data);
        setOrders(data);
      } catch (err) {
        console.error("Error in fetchOrders:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  if (isAuthLoading) {
    return (
      <div className="container px-4 py-16 md:px-6 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container px-4 py-16 md:px-6">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-500">Please log in to view your orders</p>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container px-4 py-16 md:px-6 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-16 md:px-6">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container px-4 py-16 md:px-6">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-500">You haven't placed any orders yet</p>
          <Link href="/products">
            <Button>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-16 md:px-6">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-8">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  Order #{order.id.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(order.total)}</p>
                <p className="text-sm capitalize">{order.status.toLowerCase()}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative aspect-square h-16 w-16 min-w-[64px] overflow-hidden rounded-md">
                      <Image
                        src={item.product?.imageUrl || "/images/placeholder-1.jpg"}
                        alt={item.product?.name || "Product"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 