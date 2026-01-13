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
  rider_id: string;
  rider_full_name: string;
  status: string;
}

const DeliveriesPage = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("deliveries")
    .select(
      `
      id,
      order_id,
      status,
      rider_id
    `
    );

  const { data: deliveriesData, error: deliveriesError } = await supabase
    .from("deliveries")
    .select(
      `
      id,
      order_id,
      status,
      rider_id
    `
    );

  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name
    `
    );

  if (deliveriesError) {
    console.error("Supabase deliveries query error:", deliveriesError);
    return { deliveries: [] };
  }

  if (profilesError) {
    console.error("Supabase profiles query error:", profilesError);
    return { deliveries: [] };
  }

  console.log("Raw Supabase deliveries data:", deliveriesData);
  console.log("Raw Supabase profiles data:", profilesData);

  const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile.full_name]));

  const deliveries: DeliveryData[] = deliveriesData.map((delivery: any) => ({
    id: delivery.id,
    order_id: delivery.order_id,
    status: delivery.status,
    rider_id: delivery.rider_id,
    rider_full_name: profilesMap.get(delivery.rider_id) || "N/A",
  }));

  console.log("Processed deliveries data (manual join):", deliveries);

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
                <TableHead>Rider Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.id}</TableCell>
                  <TableCell>{delivery.order_id}</TableCell>
                  <TableCell>
                    {delivery.rider_full_name}
                  </TableCell>
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
