export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

// Basic shipping options (you can replace these with real shipping API calls)
const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    price: 5.99,
    estimatedDays: '5-7 business days',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 14.99,
    estimatedDays: '2-3 business days',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    price: 29.99,
    estimatedDays: '1 business day',
  },
];

export function calculateShipping(
  items: { quantity: number }[],
  shippingMethod: string
): number {
  const baseShippingOption = SHIPPING_OPTIONS.find(
    (option) => option.id === shippingMethod
  );

  if (!baseShippingOption) {
    throw new Error('Invalid shipping method');
  }

  // Calculate total items for weight-based calculation
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Add $2 for each additional item after the first
  const additionalItemsCost = Math.max(0, totalItems - 1) * 2;

  return baseShippingOption.price + additionalItemsCost;
}

export function getShippingOptions(): ShippingOption[] {
  return SHIPPING_OPTIONS;
}

// For future implementation: integrate with a real shipping API
export async function getShippingRatesFromAPI(
  address: ShippingAddress,
  items: { weight: number; quantity: number }[]
): Promise<ShippingOption[]> {
  // TODO: Integrate with a shipping carrier API (e.g., UPS, FedEx, USPS)
  // For now, return static options
  return SHIPPING_OPTIONS;
} 