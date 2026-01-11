import { LogisticsSidebar } from "@/components/logistics/sidebar"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { UserPlus, Truck } from "lucide-react"
import { AssignRiderButton } from "@/components/logistics/AssignRiderButton"
import { Rider } from "@/lib/types" // Import the new Rider interface

export default async function LogisticsDashboard() {
  const supabase = await createClient()

  // Fetch pending orders that need delivery assignment
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("*, customer_accounts(first_name, middle_name, last_name)")
    .eq("status", "pending")

  // Fetch active riders
  const { data: ridersData, error: ridersError } = await supabase.from("profiles").select("id, full_name, role")
  if (ridersError) {
    console.error("Error fetching riders:", ridersError);
  }
  const riders: Rider[] = ridersData?.filter((rider: Rider) => rider.role === "rider") || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count: deliveredTodayCount } = await supabase
    .from("orders")
    .select("id", { count: "exact" })
    .eq("status", "delivered")
    .gte("delivered_at", today.toISOString())
    .lt("delivered_at", tomorrow.toISOString());

  return (
    <div className="flex min-h-screen bg-slate-50">
      <LogisticsSidebar /> {/* In a real app, this would be specialized for Logistics */}
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Logistics Control</h1>
            <p className="text-sm text-muted-foreground">Manage order distribution and delivery riders</p>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Dispatch</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders?.length || 0}</div>
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
              <div className="text-2xl font-bold">{deliveredTodayCount || 0}</div>
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
                    <TableCell>
                      {`${order.customer_accounts?.first_name} ${order.customer_accounts?.middle_name ? order.customer_accounts.middle_name + ' ' : ''}${order.customer_accounts?.last_name}`}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs">
                      {JSON.stringify(order.shipping_address)}
                    </TableCell>
                    <TableCell>
                      <AssignRiderButton orderId={order.id} riders={riders} />
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
