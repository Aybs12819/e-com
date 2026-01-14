import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server";

interface Delivery {
  id: string;
  order_id: string;
  rider_id: string;
  status: string;
  created_at: string;
  tracking_number: string;
  estimated_delivery: string;
  rider: { full_name: string } | null;
}

export default async function AdminLogisticsPage() {
  const supabase = await createClient()
  const { data: deliveries }: { data: Delivery[] | null } = await supabase
    .from("deliveries")
    .select("*, rider:profiles!rider_id(full_name)")
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Logistics Overview</h1>
          <p className="text-sm text-muted-foreground">Monitor delivery statuses and rider assignments.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Rider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries?.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">{delivery.tracking_number}</TableCell>
                    <TableCell>{delivery.rider?.full_name || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{delivery.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {delivery.estimated_delivery ? new Date(delivery.estimated_delivery).toLocaleDateString() : "TBD"}
                    </TableCell>
                  </TableRow>
                ))}
                {!deliveries?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No active deliveries found.
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