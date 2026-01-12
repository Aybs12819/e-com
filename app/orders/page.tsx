"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { createBrowserClient } from "@supabase/ssr";
import { Product } from "@/lib/types"; // Import Product interface
import { getEstimatedDays } from "@/lib/shipping";
import { ReviewModal } from "@/components/ReviewModal";

interface ProductVariation {
  id: string;
  product_id: string;
  variation_name: string;
  type: string;
  variation_value: string;
  price_adjustment: number;
  stock_quantity: number;
  sku: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product_id: string;
  variation_id: string | null;
  products: Product | null;
  product_variations: ProductVariation | null;
}

interface Order {
  id: string;
  customer_id: string | null;
  total_amount: number;
  status:
    | "pending"
    | "confirmed order"
    | "delivery rider assigned"
    | "completed";
  shipping_address: any;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  shipping_fee: number; // Add shipping_fee to the Order interface
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      } else {
        setSession(data.session);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const customerId = session?.user?.id;

      if (!customerId || customerId === "") {
        console.warn("Skipping order fetch: invalid customer ID.");
        setOrders([]);
        return;
      }

      const { data: ordersData, error } = await supabaseClient
        .from("orders")
        .select("*, shipping_fee") // Select shipping_fee
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        return;
      }

      const validOrders = (ordersData || []).filter(
        (order) => order.id && order.id !== ""
      );

      const ordersWithItems = await Promise.all(
        validOrders.map(async (order: Order) => {
          // console.log("Fetching order items for order.id:", order.id);

          const { data: orderItemsData, error: orderItemsError } =
            await supabaseClient
              .from("order_items")
              .select(
                "id, quantity, price, product_id, variation_id, products:products(*)"
              )
              .eq("order_id", order.id);

          if (orderItemsError) {
            console.error("Error fetching order items:", orderItemsError);
            return { ...order, order_items: [] };
          }

          const orderItemsWithDetails = await Promise.all(
            (orderItemsData || []).map(async (item: any) => {
              let productData = null;
              if (item.product_id) {
                const { data: product, error: productError } =
                  await supabaseClient
                    .from("products")
                    .select("*")
                    .eq("id", item.product_id)
                    .single();
                if (productError) {
                  console.error("Error fetching product:", productError);
                } else {
                  productData = product;
                }
              }

              return {
                ...item,
                products: productData || {
                  name: "Unknown Product",
                  image_urls: [],
                },
                product_variations: item.product_variations || {
                  variation_name: "Unknown",
                  variation_value: "Unknown",
                },
              };
            })
          );

          const orderSubtotal = orderItemsWithDetails.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          // Use the shipping_fee directly from the order object
          const shippingFee = order.shipping_fee;

          return {
            ...order,
            order_items: orderItemsWithDetails,
            orderSubtotal,
            shippingFee,
          };
        })
      );
      setOrders(ordersWithItems);
    };

    fetchOrders();
  }, [session?.user?.id]); // Depend on session.user.id directly

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Purchase</h1>
        </div>

        <Tabs
          defaultValue="all"
          className="w-full mb-6"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="w-full justify-start bg-white border-b rounded-none h-12 p-0 gap-8 px-4">
            <TabsTrigger
              value="all"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="confirmed order"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              Confirmed Order
            </TabsTrigger>
            <TabsTrigger
              value="delivery rider assigned"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              Delivery Rider Assigned
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded shadow-sm text-gray-300">
              <ShieldAlert className="h-16 w-16 mb-4 opacity-10" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      Order ID: {order.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs text-emerald-600 font-medium">
                      {order.status}
                    </span>
                    {order.status === "delivery rider assigned" && (
                      <span className="text-xs text-gray-500">
                        {(() => {
                          try {
                            let municipality = "";
                            let region = "";

                            // Handle different shipping_address formats
                            if (typeof order.shipping_address === "string") {
                              try {
                                // Try to parse as JSON first
                                const parsed = JSON.parse(
                                  order.shipping_address
                                );
                                if (parsed.municipality && parsed.region) {
                                  municipality = parsed.municipality;
                                  region = parsed.region;
                                } else {
                                  // Fall back to string splitting
                                  const parts =
                                    order.shipping_address.split(", ");
                                  if (parts.length >= 2) {
                                    municipality = parts[0].trim();
                                    region = parts[1].trim();
                                  }
                                }
                              } catch (jsonError) {
                                // If JSON parsing fails, try string splitting
                                const parts =
                                  order.shipping_address.split(", ");
                                if (parts.length >= 2) {
                                  municipality = parts[0].trim();
                                  region = parts[1].trim();
                                }
                              }
                            } else if (
                              typeof order.shipping_address === "object" &&
                              order.shipping_address !== null
                            ) {
                              municipality =
                                order.shipping_address.municipality || "";
                              region = order.shipping_address.region || "";
                            }

                            const days = getEstimatedDays(region, municipality);

                            if (days) {
                              return `Estimated arrival: ${days}-${
                                days + 1
                              } days`;
                            }
                          } catch (e) {
                            console.error("Error parsing shipping address:", e);
                          }
                          return "";
                        })()}
                      </span>
                    )}
                    {order.status === "completed" && order.customer_id && (
                      <ReviewModal
                        orderId={order.id}
                        customerId={order.customer_id}
                      />
                    )}
                  </div>
                </div>

                {order.order_items.map((item) => (
                  <div key={item.id} className="p-4 border-b">
                    <div className="flex gap-4">
                      {item.products && item.products.image_urls && (
                        <img
                          alt={item.products.name}
                          className="aspect-square rounded border-2 border-gray900 object-cover h-20 w-20"
                          src={
                            item.products.image_urls?.[0] || "/placeholder.jpg"
                          }
                        />
                      )}
                      <div className="flex-1">
                        {item.products ? (
                          <h3 className="text-sm font-medium">
                            {item.products.name}
                          </h3>
                        ) : null}

                        <p className="text-xs text-gray-500 mt-1">
                          x{item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-primary">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-slate-50/50">
                  {/* Calculate subtotal for the current order */}
                  {(() => {
                    const orderSubtotal = order.order_items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    );
                    const shippingFee = order.shipping_fee;

                    return (
                      <>
                        <div className="flex justify-end items-center gap-4 mb-2">
                          <span className="text-xs text-gray-500">
                            Shipping Fee:
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            ₱{shippingFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-end items-center gap-4">
                          <span className="text-xs text-gray-500">
                            Order Total:
                          </span>
                          <span className="text-xl font-bold text-primary">
                            ₱{order.total_amount.toFixed(2)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
