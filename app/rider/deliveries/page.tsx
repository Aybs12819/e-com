import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, PackageCheck, Truck, User, LogOut } from "lucide-react";
import Link from "next/link";
import DeliveryCard from "@/components/rider/DeliveryCard";
import { LogoutButton } from "@/components/logout-button";

export default async function RiderDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Handle case where user is not logged in or session is invalid
    return (
      <div className="min-h-screen bg-slate-50 p-4 pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">
          Please log in to view your deliveries.
        </p>
      </div>
    );
  }

  const { data: activeDeliveries, error: activeDeliveriesError } = await supabase
    .from("deliveries")
    .select(
      `*, orders(id, customer_id, total_amount, shipping_address, customer_accounts(first_name, middle_name, last_name, phone)), custom_products(id, name, base_price, description, images, customer_accounts(first_name, middle_name, last_name, phone, address))`
    )
    .eq("rider_id", user.id)
    .eq("status", "assigned");

  if (activeDeliveriesError) {
    console.error("Error fetching active deliveries:", activeDeliveriesError);
  }

  console.log("Active Deliveries:", activeDeliveries);

  const { data: completedDeliveries } = await supabase
    .from("deliveries")
    .select(
      `*, orders(id, total_amount, shipping_address, customer_accounts(first_name, middle_name, last_name, phone)), custom_products(id, name, base_price, description, images, customer_accounts(first_name, middle_name, last_name, phone, address))`
    )
    .eq("rider_id", user.id)
    .eq("status", "completed")
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary">My Deliveries</h1>
          <p className="text-xs text-muted-foreground">
            You have {`${activeDeliveries?.length || 0}`} active assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/rider/profile">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Active ({activeDeliveries?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <PackageCheck className="h-4 w-4" />
            Completed ({completedDeliveries?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {activeDeliveries?.map((delivery) => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
            {!activeDeliveries?.length && (
              <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                <Truck className="mb-2 h-12 w-12 opacity-20" />
                <p>No active deliveries assigned to you yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {completedDeliveries?.map((delivery) => {
              const isCustomProduct = !!delivery.custom_product_id;
              const referenceData = isCustomProduct
                ? delivery.custom_products
                : delivery.orders;
              const customerData = referenceData?.customer_accounts;

              return (
                <Card
                  key={delivery.id}
                  className="overflow-hidden border-l-4 border-l-green-500"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-bold">
                      {isCustomProduct
                        ? `Custom Product: ${
                            (referenceData as any)?.name || "N/A"
                          }`
                        : `Order #${referenceData?.id?.slice(0, 8) || "N/A"}`}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      Completed
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
                        <span>
                          {customerData?.phone || "Phone number not available"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <span>
                          {isCustomProduct
                            ? customerData?.address || "Address not available"
                            : (referenceData as any)?.shipping_address || "N/A"}
                        </span>
                      </div>
                      {isCustomProduct &&
                        (referenceData as any)?.description && (
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
                            ? (referenceData as any)?.base_price?.toFixed(2)
                            : (referenceData as any)?.total_amount?.toFixed(
                                2
                              ) || "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {!completedDeliveries?.length && (
              <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                <PackageCheck className="mb-2 h-12 w-12 opacity-20" />
                <p>No completed deliveries yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
