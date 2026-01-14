import { AdminSidebar } from "@/components/admin/sidebar";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

interface CustomerAccount {
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

interface OrderData {
  id: string;
  customer_id: string | null;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  shipping_fee: number;
  rider_id: string | null;
  customer_accounts: CustomerAccount | null;
}

const OrdersPage = async () => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select(
      `*,
      customer_accounts(*)
      `
    )
    .returns<OrderData[]>();

  const orders = data ?? [];

  const updateOrderStatus = async (formData: FormData) => {
    "use server";
    const orderId = formData.get("orderId") as string;
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: "confirmed order" })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error);
    }

    revalidatePath("/admin/orders");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view all orders.
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Shipping Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shipping Address</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const customer = order.customer_accounts;
                let fullName = "Unknown Customer";
                let email = "N/A";
                let phone = "N/A";

                if (customer) {
                  const customerNameParts = [
                    customer.first_name,
                    customer.middle_name,
                    customer.last_name,
                  ].filter(Boolean);
                  if (customerNameParts.length > 0) {
                    fullName = customerNameParts.join(" ");
                  }
                  email = customer.email || "N/A";
                  phone = customer.phone || "N/A";
                }

                return (
                  <TableRow key={order.id}>
                    <TableCell>{fullName}</TableCell>
                    <TableCell>₱{order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>₱{order.shipping_fee.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        className="text-xs capitalize"
                        variant={
                          order.status === "pending"
                            ? "outline"
                            : order.status === "delivered"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.shipping_address}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("en-PH")}
                    </TableCell>
                    <TableCell>
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          disabled={order.status !== "pending"}
                        >
                          Confirm Order
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
