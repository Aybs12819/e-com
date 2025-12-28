import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Truck, ShieldAlert } from "lucide-react"

export default function MyOrdersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Purchase</h1>
        </div>

        <Tabs defaultValue="all" className="w-full mb-6">
          <TabsList className="w-full justify-start bg-white border-b rounded-none h-12 p-0 gap-8 px-4">
            <TabsTrigger
              value="all"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="to-pay"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              To Pay
            </TabsTrigger>
            <TabsTrigger
              value="to-ship"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              To Ship
            </TabsTrigger>
            <TabsTrigger
              value="to-receive"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              To Receive
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {[1].map((i) => (
            <div key={i} className="bg-white rounded shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">LinkHabi Official Store</span>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase bg-transparent">
                    Visit Shop
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">Parcel is out for delivery</span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs font-bold text-primary uppercase">To Receive</span>
                </div>
              </div>

              <div className="p-4 border-b">
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded border bg-gray-50 overflow-hidden">
                    <img
                      src="/product-.jpg?height=80&width=80&query=order-1"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">Mapita Heritage Woven Bag - Large</h3>
                    <p className="text-xs text-gray-400 mt-1">Variation: Earth Brown</p>
                    <p className="text-xs text-gray-500 mt-1">x1</p>
                  </div>
                  <div className="text-sm font-bold text-primary">₱450.00</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50/50">
                <div className="flex justify-end items-center gap-4">
                  <span className="text-xs text-gray-500">Order Total:</span>
                  <span className="text-xl font-bold text-primary">₱450.00</span>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" className="h-9 px-6 text-xs bg-transparent">
                    Contact Seller
                  </Button>
                  <Button className="h-9 px-6 text-xs bg-primary hover:bg-primary/90">Track Order</Button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col items-center justify-center py-20 bg-white rounded shadow-sm text-gray-300">
            <ShieldAlert className="h-16 w-16 mb-4 opacity-10" />
            <p className="text-sm">No orders yet</p>
          </div>
        </div>
      </main>
    </div>
  )
}
