"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, PackageCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DeliveryCardProps {
  delivery: {
    id: string;
    status: string;
    rider_id: string;
    order_id: string | null;
    custom_product_id: string | null;
    orders: {
      id: string;
      total_amount: number;
      shipping_address: string;
      customer_accounts: {
        first_name: string;
        middle_name: string | null;
        last_name: string;
        phone: string;
      } | null;
    } | null;
    custom_products: {
      id: string;
      name: string;
      base_price: number;
      description: string | null;
      images: string[];
      customer_accounts: {
        first_name: string;
        middle_name: string | null;
        last_name: string;
        phone: string | null;
        address: string | null;
      } | null;
    } | null;
  };
}

export default function DeliveryCard({ delivery }: DeliveryCardProps) {
  const router = useRouter();

  const isCustomProduct = !!delivery.custom_product_id;
  const referenceData = isCustomProduct
    ? delivery.custom_products
    : delivery.orders;
  const customerData = referenceData?.customer_accounts;

  const handleMarkDelivered = async (deliveryId: string) => {
    console.log("Marking delivery as delivered:", deliveryId);

    // Update delivery status and actual_delivery timestamp
    const { error: deliveryError } = await supabase
      .from("deliveries")
      .update({
        status: "completed",
        actual_delivery: new Date().toISOString(),
      })
      .eq("id", deliveryId);

    if (deliveryError) {
      console.error("Error marking delivery as delivered:", deliveryError);
      return;
    }

    // Update order or custom product status to completed
    if (isCustomProduct && delivery.custom_products?.id) {
      // Update custom product status via API
      const response = await fetch("/api/admin/custom-products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customProductId: delivery.custom_products.id,
          customProductData: { status: "Completed" },
        }),
      });

      if (!response.ok) {
        console.error("Error updating custom product status");
        return;
      }
    } else if (!isCustomProduct && delivery.orders?.id) {
      // Update order status directly
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", delivery.orders.id);

      if (orderError) {
        console.error("Error updating order status:", orderError);
        return;
      }
    }

    console.log("Delivery marked as completed successfully!");
    router.refresh(); // Refresh the page to update the list of deliveries
  };

  return (
    <Card
      key={delivery.id}
      className="overflow-hidden border-l-4 border-l-accent"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold">
          {isCustomProduct
            ? `Custom Product: ${(referenceData as any)?.name || "N/A"}`
            : `Order #${referenceData?.id?.slice(0, 8) || "N/A"}`}
        </CardTitle>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Assigned
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Customer:</span>
            <span>
              {customerData
                ? `${customerData.first_name} ${
                    customerData.middle_name || ""
                  } ${customerData.last_name}`.trim()
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{customerData?.phone || "Phone number not available"}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>
              {isCustomProduct
                ? (customerData as any)?.address || "Address not available"
                : (referenceData as any)?.shipping_address || "N/A"}
            </span>
          </div>
          {isCustomProduct && (referenceData as any)?.description && (
            <div className="flex items-start gap-2 text-sm">
              <span className="font-medium">Description:</span>
              <span className="text-xs text-muted-foreground">
                {(referenceData as any).description}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              {isCustomProduct ? "Product Price:" : "Total Amount:"}
            </span>
            <span>
              ₱
              {isCustomProduct
                ? (Number((referenceData as any)?.base_price) || 0).toFixed(2)
                : (referenceData as any)?.total_amount?.toFixed(2) || "N/A"}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            className="w-full gap-2 text-xs bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleMarkDelivered(delivery.id)}
          >
            <PackageCheck className="h-4 w-4" />
            Mark Delivered
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
