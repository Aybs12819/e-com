import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Minus, Plus } from "lucide-react"

export default function CartPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-4">
            {/* Cart Header */}
            <div className="grid grid-cols-[auto_1fr_120px_120px_120px_50px] items-center gap-4 bg-white p-4 rounded shadow-sm text-sm font-medium text-gray-500">
              <Checkbox />
              <span>Product</span>
              <span className="text-center">Unit Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-center">Total Price</span>
              <span></span>
            </div>

            {/* Cart Item Placeholder */}
            {[1, 2].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[auto_1fr_120px_120px_120px_50px] items-center gap-4 bg-white p-4 rounded shadow-sm"
              >
                <Checkbox />
                <div className="flex gap-3">
                  <div className="h-20 w-20 rounded border bg-gray-50 overflow-hidden">
                    <img
                      src={`/product-.jpg?height=80&width=80&query=cart-${i}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-sm font-medium line-clamp-2">
                      Mapita Heritage Woven Bag - Large Variation {i}
                    </h3>
                    <span className="text-xs text-gray-400 mt-1">Variation: Brown</span>
                  </div>
                </div>
                <div className="text-center text-sm font-medium">₱450.00</div>
                <div className="flex items-center justify-center border rounded h-8 w-24 mx-auto">
                  <button className="px-2 hover:bg-gray-100">
                    <Minus className="h-3 w-3" />
                  </button>
                  <input type="text" value="1" className="w-8 text-center text-sm border-x" readOnly />
                  <button className="px-2 hover:bg-gray-100">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-center text-sm font-bold text-primary">₱450.00</div>
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded shadow-sm sticky top-44">
              <h2 className="font-bold border-b pb-4 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal (2 items)</span>
                  <span>₱900.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping Fee</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="pt-4 border-t flex justify-between items-end">
                  <span className="font-bold">Total Payment</span>
                  <span className="text-2xl font-bold text-primary">₱900.00</span>
                </div>
              </div>
              <Button className="w-full mt-6 h-12 bg-primary hover:bg-primary/90 text-lg font-bold">Check Out</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
