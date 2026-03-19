import { createClient } from '@/lib/supabase/server';
import { Navbar } from "@/components/navbar"
import { HeroCarousel } from "@/components/hero-carousel"
import { CategoryGrid } from "@/components/category-grid"
import { MapitaCommunity } from "@/components/mapita-community"
import Link from "next/link"

export default async function Home() {
  const supabase = await createClient();
  const { data: productsData, error } = await supabase.from("products").select("*");

  if (error) {
    console.error("Error fetching products:", error);
    return <div>Error loading products.</div>;
  }

  // Fetch sold_count for each product using the RPC function
  const productsWithSoldCount = await Promise.all(
    productsData.map(async (product) => {
      const { data: soldCount, error: soldCountError } = await supabase.rpc('get_product_sold_count', { p_product_id: product.id });
      const { data: averageRatingData, error: averageRatingError } = await supabase.rpc('get_product_average_rating', { p_product_id: product.id });

      const average_rating = Number(averageRatingData?.[0]?.average_rating || 0);
      const review_count = Number(averageRatingData?.[0]?.review_count || 0);

      if (soldCountError) {
        console.error(`Error fetching sold count for product ${product.id}:`, soldCountError);
      }
      if (averageRatingError) {
        console.error(`Error fetching average rating for product ${product.id}:`, averageRatingError);
      }

      return {
        ...product,
        sold_count: Number(soldCount || 0),
        average_rating: average_rating,
        review_count: review_count,
      };
    })
  );
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <HeroCarousel />
      <CategoryGrid />

      {/* Featured Products Placeholder Section */}
      <section className="container mx-auto px-4 py-8 flex-grow">
      <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">Products</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {productsWithSoldCount.map((product) => (
            <Link
              href={`/products/${product.slug}`}
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
                <span className="text-sm font-bold text-primary">₱{product.base_price?.toFixed(2)}</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-[10px] text-gray-400">{product.average_rating?.toFixed(1) || '0.0'} ({product.review_count || 0} Reviews) | {product.sold_count || 0} Sold</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    
    {/* Footer */}
    <footer className="text-gray-600 py-6 px-8 mt-32">
      <div className="text-center text-sm">
        <p>&copy; 2026 E-COM Group. All rights reserved.</p>
        <p className="mt-2">For educational purposes only, and no copyright infringement is intended.</p>
      </div>
    </footer>
    </main>
  )
}
