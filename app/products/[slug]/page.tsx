import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ShieldCheck, Truck } from "lucide-react"

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(*), product_variations(*)")
    .eq("slug", slug)
    .single()

  if (!product) return <div>Product not found</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 bg-white p-6 rounded-lg shadow-sm">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 border">
              <img
                src={product.images?.[0] || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.images?.map((img: string, i: number) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded border cursor-pointer hover:border-primary"
                >
                  <img src={img || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span className="underline decoration-primary text-primary">4.9 Ratings</span>
                <span>|</span>
                <span>124 Sold</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <span className="text-3xl font-bold text-primary">₱{product.base_price.toFixed(2)}</span>
            </div>

            {/* Variations */}
            {product.product_variations?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 w-20">Variations</span>
                  <div className="flex flex-wrap gap-2">
                    {product.product_variations.map((v: any) => (
                      <Button
                        key={v.id}
                        variant="outline"
                        size="sm"
                        className="hover:border-primary hover:text-primary bg-transparent"
                      >
                        {v.variation_value}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-20">Shipping</span>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-emerald-600" />
                <span>Free shipping for orders over ₱500</span>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2 border-primary text-primary hover:bg-primary/5 bg-transparent"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90">
                Buy Now
              </Button>
            </div>

            <div className="border-t pt-6 flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                LinkHabi Guarantee
              </div>
              <div>7 Days Return</div>
              <div>100% Authentic</div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wider bg-slate-50 p-3">Product Specifications</h2>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <div className="grid grid-cols-[150px_1fr] gap-4">
              <span className="text-gray-400">Category</span>
              <span className="text-primary font-medium">{product.categories?.name}</span>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-4">
              <span className="text-gray-400">Stock</span>
              <span>248</span>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-4">
              <span className="text-gray-400">Ships From</span>
              <span>Mapita, Aguilar, Pangasinan</span>
            </div>
            <div className="mt-8 border-t pt-8">
              <h2 className="text-lg font-bold mb-4 uppercase tracking-wider bg-slate-50 p-3">Product Description</h2>
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
