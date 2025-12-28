import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, PackageCheck, Truck } from "lucide-react"

export default async function RiderDashboard() {
  const supabase = await createClient()

  // In a real app, we'd get the current user ID
  // For now, fetching all assigned deliveries
  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("*, orders(*, profiles(full_name, phone_number))")
    .eq("status", "assigned")

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-primary">My Deliveries</h1>
        <p className="text-xs text-muted-foreground">You have {deliveries?.length || 0} active assignments</p>
      </header>

      <div className="space-y-4">
        {deliveries?.map((delivery) => (
          <Card key={delivery.id} className="overflow-hidden border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold">Order #{delivery.orders.id.slice(0, 8)}</CardTitle>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Assigned
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span>{delivery.orders.shipping_address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{delivery.orders.profiles.phone_number || "N/A"}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 text-xs bg-transparent">
                  View Items
                </Button>
                <Button className="flex-1 gap-2 text-xs bg-emerald-600 hover:bg-emerald-700">
                  <PackageCheck className="h-4 w-4" />
                  Mark Delivered
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!deliveries?.length && (
          <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
            <Truck className="mb-2 h-12 w-12 opacity-20" />
            <p>No deliveries assigned to you yet.</p>
          </div>
        )}
      </div>

      {/* Mobile-style bottom nav for Rider */}
      <nav className="fixed bottom-0 left-0 flex w-full border-t bg-white p-2">
        <Button variant="ghost" className="flex-1 flex-col h-auto py-2">
          <Truck className="h-5 w-5 mb-1 text-primary" />
          <span className="text-[10px]">Deliveries</span>
        </Button>
        <Button variant="ghost" className="flex-1 flex-col h-auto py-2 opacity-50">
          <PackageCheck className="h-5 w-5 mb-1" />
          <span className="text-[10px]">Completed</span>
        </Button>
      </nav>
    </div>
  )
}
