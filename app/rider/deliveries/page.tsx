import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, PackageCheck, Truck } from "lucide-react"
import DeliveryCard from "@/components/rider/DeliveryCard"

export default async function RiderDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Handle case where user is not logged in or session is invalid
    return (
      <div className="min-h-screen bg-slate-50 p-4 pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your deliveries.</p>
      </div>
    );
  }

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("*, orders(*, customer_accounts(phone))")
    .eq("rider_id", user.id)
    .eq("status", "assigned");

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-primary">My Deliveries</h1>
        <p className="text-xs text-muted-foreground">You have {`${deliveries?.length || 0}`} active assignments</p>
      </header>
 
       <div className="space-y-4">
         {deliveries?.map((delivery) => {
           return (
             <DeliveryCard key={delivery.id} delivery={delivery} />
           );
         })}
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
