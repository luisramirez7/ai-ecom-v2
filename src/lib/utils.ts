import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Prisma } from "@prisma/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: Prisma.Decimal | number) {
  const numericPrice = typeof price === 'number' ? price : parseFloat(price.toString())
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
  }).format(numericPrice)
}
