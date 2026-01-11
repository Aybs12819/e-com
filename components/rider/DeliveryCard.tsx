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
    orders: {
      id: string;
      shipping_address: string;
      customer_accounts: {
        phone: string;
      } | null;
    } | null;
  };
}

export default function DeliveryCard({ delivery }: DeliveryCardProps) {
  const router = useRouter();

  const handleMarkDelivered = async (deliveryId: string) => {
    console.log("Marking delivery as delivered:", deliveryId);
    const { error } = await supabase
      .from("deliveries")
      .update({ status: "completed" })
      .eq("id", deliveryId);

    if (error) {
      console.error("Error marking delivery as delivered:", error);
    } else {
      console.log("Delivery marked as delivered successfully!");
      router.refresh(); // Refresh the page to update the list of deliveries
    }
  };

  return (
    <Card key={delivery.id} className="overflow-hidden border-l-4 border-l-accent">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold">Order #{delivery.orders?.id?.slice(0, 8) || "N/A"}</CardTitle>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Assigned
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <span>{delivery.orders?.shipping_address || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{delivery.orders?.customer_accounts?.phone || "Phone number not available"}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1 text-xs bg-transparent">
            View Items
          </Button>
          <Button
            className="flex-1 gap-2 text-xs bg-emerald-600 hover:bg-emerald-700"
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