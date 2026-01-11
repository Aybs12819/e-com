"use client"
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay";

const banners = [
  {
    title: "Handloom Heritage",
    subtitle: "Discover Mapita's finest woven products",
    image: "/handloom-weaving-texture.jpg",
    color: "bg-blue-900",
  },
  {
    title: "Aguilar Delicacies",
    subtitle: "Taste the local flavors of Aguilar",
    image: "/local-filipino-food-delicacies.jpg",
    color: "bg-amber-800",
  },
  {
    title: "Support Local Crafts",
    subtitle: "Unique handmade accessories for every occasion",
    image: "/handmade-beaded-jewelry.jpg",
    color: "bg-emerald-900",
  },
];

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [plugin.current]);

  return (
    <section className="container mx-auto px-4 py-6">
      <Carousel
        plugins={[plugin.current]}
        opts={{
          align: "start",
        }}
        className="w-full overflow-hidden rounded-xl shadow-lg"
      >
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[400px] w-full">
                <img
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-start justify-center p-12 text-white">
                  <h2 className="text-4xl font-bold md:text-5xl">{banner.title}</h2>
                  <p className="mt-4 text-xl opacity-90">{banner.subtitle}</p>
                  <button className="mt-8 rounded-md bg-accent px-8 py-3 font-bold text-accent-foreground transition-all hover:scale-105">
                    Shop Now
                  </button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
