import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-4 mb-10">
          <h1 className="text-3xl font-bold">About BikeMounts</h1>
          <p className="text-muted-foreground text-lg">
            The story behind our commitment to better urban mobility
          </p>
        </div>
        
        <div className="grid gap-10 md:grid-cols-2 items-center mb-16">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Mission</h2>
            <p className="text-muted-foreground">
              BikeMounts was founded in 2023 with a simple mission: to make navigating cities on share bikes easier and safer. We noticed that while share bikes have revolutionized urban transport, they lacked a secure way to mount smartphones for navigation.
            </p>
            <p className="text-muted-foreground">
              Our team of cycling enthusiasts and product designers set out to create phone mounts specifically designed for the unique challenges of share bikes - easy to attach and detach, secure enough for city riding, and compatible with the widest range of bike models and phone sizes.
            </p>
          </div>
          <div className="aspect-video relative rounded-lg overflow-hidden bg-muted flex items-center justify-center text-xl">
            Our Mission Image Placeholder
          </div>
        </div>
        
        <div className="grid gap-10 md:grid-cols-2 items-center mb-16 md:order-reverse">
          <div className="space-y-4 md:order-last">
            <h2 className="text-2xl font-semibold">Why Share Bikes?</h2>
            <p className="text-muted-foreground">
              Share bikes have transformed how people move around cities - they're convenient, environmentally friendly, and cost-effective. But navigating unfamiliar city streets often requires a smartphone for directions.
            </p>
            <p className="text-muted-foreground">
              Standard phone mounts are designed for personal bikes and often require tools or permanent installation. Our mounts are designed to be temporarily attached to any share bike in seconds, then easily removed when your ride is complete.
            </p>
          </div>
          <div className="aspect-video relative rounded-lg overflow-hidden bg-muted flex items-center justify-center text-xl">
            Share Bikes Image Placeholder
          </div>
        </div>
        
        <div className="grid gap-10 md:grid-cols-2 items-center mb-16">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Sustainability Commitment</h2>
            <p className="text-muted-foreground">
              We believe that share bikes are part of a more sustainable urban future, and our products reflect that commitment. Our mounts are built to last from durable, recyclable materials, and we're continually working to reduce packaging waste and carbon footprint.
            </p>
            <p className="text-muted-foreground">
              For every 100 mounts sold, we plant a tree in urban areas to contribute to cooler, greener cities for cyclists everywhere.
            </p>
          </div>
          <div className="aspect-video relative rounded-lg overflow-hidden bg-muted flex items-center justify-center text-xl">
            Sustainability Image Placeholder
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Our Team</h2>
            <p className="text-muted-foreground">
              Meet the cycling enthusiasts behind BikeMounts
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex flex-col items-center space-y-2 p-4">
                <div className="w-32 h-32 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                  Team {index}
                </div>
                <h3 className="font-semibold text-lg">Team Member {index}</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Cycling enthusiast and product designer with a passion for urban mobility.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 