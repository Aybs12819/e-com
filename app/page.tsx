import { createClient } from '@/lib/supabase/server';
import { Navbar } from "@/components/navbar"
import { HeroCarousel } from "@/components/hero-carousel"
import { CategoryGrid } from "@/components/category-grid"
import { MapitaCommunity } from "@/components/mapita-community"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const supabase = await createClient();
  const { data: products, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Error fetching products:", error);
    return <div>Error loading products.</div>;
  }
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <HeroCarousel />
      <CategoryGrid />

      {/* Featured Products Placeholder Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">Products</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-sm bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden bg-gray-100">
                <img
                  src={product.image_urls?.[0] || "/placeholder.jpg"}
                  alt={product.name || "Product"}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-2">
                <h3 className="line-clamp-2 text-xs text-gray-700">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">₱{product.base_price?.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-400">{product.sold_count || 0} Sold</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <MapitaCommunity />
    </main>
  )
}
