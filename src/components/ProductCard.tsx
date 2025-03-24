"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export function ProductCard({ id, name, description, price, imageUrl }: ProductCardProps) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    router.push(`/products/${id}`);
  };

  return (
    <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md" onClick={handleCardClick}>
      <div className="aspect-square relative">
        <Image
          src={imageUrl || '/product-placeholder.jpg'}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 h-10 mt-1">{description}</p>
        <p className="font-medium text-lg mt-2">${price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2 justify-between">
        <Button asChild variant="outline" className="w-1/2">
          <Link href={`/products/${id}`}>Details</Link>
        </Button>
        <Button className="w-1/2">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
} 