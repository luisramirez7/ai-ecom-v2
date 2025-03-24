export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  inventory: number;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<boolean>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
  createOrder: () => Promise<any | null>;
}

export interface Product {
  name: string;
  price: number;
  image_url: string | null;
  inventory: number;
}

export interface CartItemResponse {
  id: string;
  product_id: string;
  quantity: number;
  products: Product;
} 