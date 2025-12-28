import { Navbar } from "@/components/navbar"
import { HeroCarousel } from "@/components/hero-carousel"
import { CategoryGrid } from "@/components/category-grid"
import { MapitaCommunity } from "@/components/mapita-community"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <HeroCarousel />
      <CategoryGrid />
      <MapitaCommunity />

      {/* Featured Products Placeholder Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between border-b bg-white p-4 shadow-sm">
          <h2 className="text-xl font-bold text-primary uppercase tracking-wider">Flash Sale</h2>
          <Button variant="link" className="text-primary font-bold">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="group overflow-hidden rounded-sm bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden bg-gray-100">
                <img
                  src={`/product-.jpg?height=200&width=200&query=product-${i}`}
                  alt="Product"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 h-10 text-xs text-gray-700">Premium Mapita Heritage Product {i}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">₱249.00</span>
                  <span className="text-[10px] text-gray-400">12 Sold</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
