import { createClient } from '@/lib/supabase/server';
import { Navbar } from "@/components/navbar";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query = '' } = await searchParams;
  const supabase = await createClient();

  let products = [];
  
  if (query) {
    // Search products by name or description
    const { data: productsData, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error searching products:", error);
    } else {
      // Fetch sold_count and ratings for each product
      products = await Promise.all(
        productsData.map(async (product) => {
          const { data: soldCount, error: soldCountError } = await supabase.rpc('get_product_sold_count', { p_product_id: product.id });
          const { data: averageRatingData, error: averageRatingError } = await supabase.rpc('get_product_average_rating', { p_product_id: product.id });

          const average_rating = Number(averageRatingData?.[0]?.average_rating || 0);
          const review_count = Number(averageRatingData?.[0]?.review_count || 0);

          return {
            ...product,
            sold_count: Number(soldCount || 0),
            average_rating: average_rating,
            review_count: review_count,
          };
        })
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {query ? `Search Results for "${query}"` : "Search Products"}
          </h1>
          {query && (
            <p className="text-sm text-gray-600 mt-2">
              Found {products.length} product{products.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {!query ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a search term to find products</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching "{query}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {products.map((product) => (
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
        )}
      </section>
    </main>
  );
}
