"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Menu } from "lucide-react";
import VegNonVegDot from "./veg-nonveg-dot";

type Dish = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  description?: string | null;
  spiceLevel?: string | null;
  isVegetarian: boolean;
};

type Category = {
  id: string;
  name: string;
  order: number;
  dishLinks: { dish: Dish }[];
};

type Restaurant = {
  name: string;
  location: string;
  categories: Category[];
};

export default function MenuClient({ restaurant }: { restaurant: Restaurant }) {
  const [activeCategory, setActiveCategory] = useState(
    restaurant.categories[0]?.id ?? "",
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setIsMenuOpen(false);
    categoryRefs.current[categoryId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const sections = Object.values(categoryRefs.current).filter(
      Boolean,
    ) as HTMLDivElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-100px 0px -50% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [restaurant.categories]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white px-6 py-5 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">{restaurant.name}</h1>
        <p className="mt-0.5 text-base text-gray-500">{restaurant.location}</p>
      </div>

      {/* Sticky Category Title Bar */}
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <h2 className="border-b border-gray-200 px-6 py-4 text-center text-xl font-bold text-gray-800">
          {restaurant.categories.find((c) => c.id === activeCategory)?.name ??
            "Menu"}
        </h2>
      </div>

      {/* Menu Content */}
      <div className="pb-32">
        {restaurant.categories
          .sort((a, b) => a.order - b.order)
          .map((category) => (
            <section
              key={category.id}
              id={category.id}
              ref={(el) => {
                categoryRefs.current[category.id] = el as HTMLDivElement | null;
              }}
              className="scroll-mt-24"
            >
              {/* Category Header */}
              <h3 className="sticky top-[73px] z-10 bg-white px-6 py-3 text-xl font-bold text-gray-800">
                {category.name}
              </h3>

              <div className="divide-y divide-gray-100">
                {category.dishLinks.map(({ dish }) => (
                  <div key={dish.id} className="flex gap-4 bg-white px-6 py-5">
                    {/* Left side - Dot + Name + Price + Desc */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <VegNonVegDot isVegetarian={dish.isVegetarian} />
                        <div className="flex-1">
                          <h4 className="text-lg leading-tight font-semibold text-gray-900">
                            {dish.name}
                          </h4>
                          <p className="mt-1 text-lg font-normal text-gray-700">
                            ₹ {dish.price}
                          </p>
                          {dish.description && (
                            <p className="mt-2 text-sm leading-relaxed text-gray-500">
                              {dish.description}
                              <span className="font-normal text-gray-500">
                                ...read more
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side image */}
                    {dish.imageUrl && (
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={dish.imageUrl}
                          alt={dish.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
      </div>

      {/* Floating Menu Button - Bottom Center */}
      <Button
        className="fixed bottom-6 left-1/2 z-50 h-12 -translate-x-1/2 rounded-full bg-rose-500 px-8 shadow-lg hover:bg-rose-600"
        onClick={() => setIsMenuOpen(true)}
      >
        <Menu className="mr-2 h-5 w-5" />
        <span className="font-semibold">Menu</span>
      </Button>

      {/* Modal Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="absolute top-1/2 left-1/2 h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-5">
              <h3 className="text-center text-xl font-bold text-rose-500">
                Recommended
              </h3>
            </div>
            <ScrollArea className="h-[calc(85vh-70px)]">
              <div className="px-6 py-2">
                {restaurant.categories
                  .sort((a, b) => a.order - b.order)
                  .map((cat) => (
                    <div key={cat.id}>
                      <h4 className="py-4 text-center text-lg font-bold text-rose-500">
                        {cat.name}
                      </h4>
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className="h-auto w-full justify-between rounded-none border-0 px-0 py-3 text-left hover:bg-transparent"
                          onClick={() => scrollToCategory(cat.id)}
                        >
                          <span className="text-base font-normal text-gray-600">
                            {cat.name}
                          </span>
                          <span className="text-base font-normal text-gray-400">
                            {cat.dishLinks.length}
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}
