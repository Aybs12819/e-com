import { LogisticsSidebar } from '@/components/logistics/sidebar';
import { createClient } from '@/lib/supabase/server';
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CustomerAccount {
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
}

interface OrderData {
  id: string;
  shipping_address: string;
  status: string;
  customer_accounts: CustomerAccount;
}

const DeliveriesPage = async () => {
  const supabase = await createClient();

  const { data } = await supabase
    .from('orders')
    .select(
      `
      id,
      shipping_address,
      status,
      customer_accounts(
        first_name,
        middle_name,
        last_name
      )
    `
    )
    .returns<OrderData[]>();

  const orders = data ?? [];

  const deliveries = orders.map((order: OrderData) => {
    return {
      id: order.id,
      orderId: order.id, // Assuming orderId is the same as deliveryId for now
      customer: [order.customer_accounts?.first_name, order.customer_accounts?.middle_name, order.customer_accounts?.last_name]
        .filter(Boolean)
        .join(" ") || "N/A",
      address: (() => {
        if (typeof order.shipping_address === 'object' && order.shipping_address !== null) {
          const { street, city, country } = order.shipping_address as { street: string, city: string, country: string };
          return `${street}, ${city}, ${country}`;
        } else if (typeof order.shipping_address === 'string') {
          try {
            const parsedAddress = JSON.parse(order.shipping_address);
            if (typeof parsedAddress === 'object' && parsedAddress !== null && 'street' in parsedAddress && 'city' in parsedAddress && 'country' in parsedAddress) {
              return `${parsedAddress.street}, ${parsedAddress.city}, ${parsedAddress.country}`;
            } else {
              return order.shipping_address;
            }
          } catch (e) {
            return order.shipping_address;
          }
        }
        return "N/A";
      })(),
      status: order.status,
    };
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <LogisticsSidebar />
      <div className="flex-1 p-6 ml-64 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Deliveries</h1>
          <p className="text-sm text-muted-foreground">Manage and view all deliveries and their statuses.</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-y-auto overflow-x-auto flex-grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Delivery ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.id}</TableCell>
                  <TableCell>{delivery.orderId}</TableCell>
                  <TableCell>{delivery.customer}</TableCell>
                  <TableCell>{delivery.address}</TableCell>
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