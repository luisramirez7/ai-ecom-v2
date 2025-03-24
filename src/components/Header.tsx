"use client";

import Link from 'next/link';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from './ui/navigation-menu';
import { Button } from './ui/button';
import { ShoppingCart, Menu } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useState } from 'react';
import { CartSheet } from './cart-sheet';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function Header() {
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between py-4 px-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="px-6">
                {/* <h2 className="text-lg font-semibold mb-5">Navigation</h2> */}
                <nav className="flex flex-col gap-6">
                  <Link href="/products" className="block py-3 text-lg font-semibold hover:text-primary">
                    Products
                  </Link>
                  <Link href="/about" className="block py-3 text-lg font-semibold hover:text-primary">
                    About Us
                  </Link>
                  <Link href="/contact" className="block py-3 text-lg font-semibold hover:text-primary">
                    Contact
                  </Link>
                  <div className="flex flex-col gap-3 mt-6">
                    <Link href="/login" className="w-full">
                      <Button variant="outline" className="w-full py-6">Login</Button>
                    </Link>
                    <Link href="/register" className="w-full">
                      <Button className="w-full py-6">Sign Up</Button>
                    </Link>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="text-xl font-bold">
            BikeMounts
          </Link>
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[280px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/products"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            All Products
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Browse our full range of share bike phone mounts
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <Link
                        href="/products/category/universal"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">Universal Mounts</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Fits all bike types
                        </p>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products/category/premium"
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-sm font-medium leading-none">Premium Mounts</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          High-end waterproof options
                        </p>
                      </Link>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    About Us
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/contact" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[1rem] rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
          <div className="hidden md:flex md:items-center md:gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>

      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  );
} 