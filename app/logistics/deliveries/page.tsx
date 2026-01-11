import { LogisticsSidebar } from "@/components/logistics/sidebar";
import { createClient } from "@/lib/supabase/server";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DeliveryData {
  id: string;
  order_id: string;
  rider_id: string | null;
  status: string;
}

const DeliveriesPage = async () => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("deliveries")
    .select(
      `
      id,
      order_id,
      rider_id,
      status
    `
    )
    .returns<DeliveryData[]>();

  const deliveries = data ?? [];

  return (
    <div className="flex h-screen bg-gray-100">
      <LogisticsSidebar />
      <div className="flex-1 p-6 ml-64 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Deliveries</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view all deliveries and their statuses.
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-y-auto overflow-x-auto flex-grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Rider ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.id}</TableCell>
                  <TableCell>{delivery.order_id}</TableCell>
                  <TableCell>{delivery.rider_id || "N/A"}</TableCell>
                  <TableCell>{delivery.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DeliveriesPage;
