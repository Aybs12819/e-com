"use client";

import { Navbar } from "@/components/navbar"
import { HeroCarousel } from "@/components/hero-carousel"
import { CategoryGrid } from "@/components/category-grid"
import { MapitaCommunity } from "@/components/mapita-community"
import Link from "next/link"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const [productsData, setProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProductsAndUser = async () => {
      // Fetch user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Fetch products
      const { data: products, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
        return;
      }

      // Fetch sold_count and average_rating for each product
      const productsWithSoldCount = await Promise.all(
        products.map(async (product) => {
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
      setProductsData(productsWithSoldCount);
      setLoading(false);
    };

    fetchProductsAndUser();
  }, []);

  const handleProductClick = (e: React.MouseEvent, productSlug: string) => {
    if (!user) {
      e.preventDefault();
      setSelectedProductSlug(productSlug);
      setShowLoginModal(true);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      
      <HeroCarousel />
      <CategoryGrid />

      {/* Featured Products Placeholder Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">Products</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {productsData.map((product) => (
            <Link
              href={`/products/${product.slug}`}
              key={product.id}
              onClick={(e) => handleProductClick(e, product.slug)}
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
      <script src='https://cdn.jotfor.ms/agent/embedjs/019b997bc1ef7a0c91310092ab9900534bfe/embed.js'></script>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to view product details. Please log in or sign up to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleLoginRedirect}>
              Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
