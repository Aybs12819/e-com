import { AdminSidebar } from "@/components/admin/sidebar" // Reusing sidebar or could specialize
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { UserPlus, Truck } from "lucide-react"

export default async function LogisticsDashboard() {
  const supabase = await createClient()

  // Fetch pending orders that need delivery assignment
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("*, profiles(full_name)")
    .eq("status", "processing")

  // Fetch active riders
  const { data: riders } = await supabase.from("profiles").select("*").eq("role", "rider")

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar /> {/* In a real app, this would be specialized for Logistics */}
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Logistics Control</h1>
            <p className="text-sm text-muted-foreground">Manage order distribution and delivery riders</p>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <UserPlus className="h-4 w-4" />
            Create Rider Account
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Dispatch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Riders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{riders?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Delivered Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Unassigned Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{order.profiles?.full_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs">{order.shipping_address}</TableCell>
                    <TableCell>
                      <Button size="sm" className="gap-2">
                        <Truck className="h-3 w-3" />
                        Assign Rider
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!pendingOrders?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No orders pending assignment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
