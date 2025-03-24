import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import { PHProvider, PostHogPageview } from "@/providers/posthog-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BikeMounts - Quality Phone Mounts for Share Bikes",
  description: "High-quality phone mounts designed specifically for share bikes and personal bicycles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <PHProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <PostHogPageview />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </PHProvider>
      </body>
    </html>
  );
}
