import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/40">
      <div className="container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">BikeMounts</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quality phone mounts for share bikes and personal bikes. Stay connected and navigate safely.
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-sm font-semibold">Products</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products/category/universal" className="text-muted-foreground hover:text-foreground">
                  Universal Mounts
                </Link>
              </li>
              <li>
                <Link href="/products/category/premium" className="text-muted-foreground hover:text-foreground">
                  Premium Mounts
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-foreground">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container px-4 md:px-6 lg:px-8 mt-12 border-t pt-8">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BikeMounts. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 