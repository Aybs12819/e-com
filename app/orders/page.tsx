"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { createBrowserClient } from "@supabase/ssr";
import { Product } from "@/lib/types";
import { getEstimatedDays } from "@/lib/shipping";
import { ReviewModal } from "@/components/ReviewModal";
import Image from "next/image";

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
  variation_id: string;
  products: any | null;
  custom_products: any | null;
  product_variations: any | null;
}

interface Order {
  id: string;
  customer_id: string | null;
  total_amount: number;
  status:
    | "pending"
    | "confirmed order"
    | "completed";
  shipping_address: any;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  shipping_fee: number;
}

interface CustomProduct {
  id: string;
  name: string;
  base_price: number;
  description: string | null;
  images: string[];
  status: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
}

export default function OrdersPage() {
  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [reviewedProductIds, setReviewedProductIds] = useState<Set<string>>(new Set());
  const supabaseClient = supabase;

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

      // Fetch existing reviews for customer
      const { data: reviewsData, error: reviewsError } = await supabaseClient
        .from("reviews")
        .select("product_id")
        .eq("customer_id", customerId);

      if (reviewsError) {
        console.error("Error fetching reviews:", reviewsError);
      } else if (reviewsData) {
        const reviewedIds = new Set(reviewsData.map((review) => review.product_id));
        setReviewedProductIds(reviewedIds);
      }

      const { data: ordersData, error } = await supabaseClient
        .from("orders")
        .select("*, shipping_fee")
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
          const { data: orderItemsData, error: orderItemsError } =
            await supabaseClient
              .from("order_items")
              .select(
                "id, quantity, price, product_id, variation_id, products:products(*), custom_products:custom_products(*)"
              )
              .eq("order_id", order.id);

          if (orderItemsError) {
            console.error("Error fetching order items:", orderItemsError);
            return { ...order, order_items: [] };
          }

          const orderItemsWithDetails = (orderItemsData || []).map(
            (item: any) => {
              const isCustomProduct =
                item.custom_products && item.custom_products.id;
              const productData = isCustomProduct
                ? item.custom_products
                : item.products;

              return {
                ...item,
                products: productData || {
                  name: "Unknown Product",
                  image_urls: [],
                },
                custom_products: item.custom_products || null,
                product_variations: item.product_variations || {
                  variation_name: "Unknown",
                  variation_value: "Unknown",
                },
              };
            }
          );

          const orderSubtotal = orderItemsWithDetails.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
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

      // Fetch custom products for this customer
      const { data: customProductsData, error: customProductsError } =
        await supabaseClient
          .from("custom_products")
          .select("*")
          .eq("customer_id", customerId)
          .order("created_at", { ascending: false });

      if (customProductsError) {
        console.error("Error fetching custom products:", customProductsError);
        setCustomProducts([]);
      } else {
        setCustomProducts(customProductsData || []);
      }
    };

    fetchOrders();
  }, [session?.user?.id]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const filteredCustomProducts = customProducts.filter((product) => {
    if (activeTab === "all") return true;
    const statusMapping: { [key: string]: string } = {
      pending: "Pending",
      "confirmed order": "Confirmed Order",
      completed: "Completed",
    };
    return (
      product.status?.toLowerCase() ===
      (statusMapping[activeTab] || activeTab).toLowerCase()
    );
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
              value="completed"
              className="data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-4 bg-transparent"
            >
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredOrders.length === 0 &&
          filteredCustomProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded shadow-sm text-gray-300">
              <ShieldAlert className="h-16 w-16 mb-4 opacity-10" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <>
              {/* Render Orders */}
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded shadow-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        Order ID: {order.id}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-600 font-medium">
                          {order.status}
                        </span>
                      </div>
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
                              item.products.image_urls?.[0] ||
                              "/placeholder.jpg"
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
                          {order.status === "completed" && order.customer_id && (
                            <ReviewModal
                              orderId={order.id}
                              customerId={order.customer_id}
                              productId={item.product_id}
                              hasReviewed={reviewedProductIds.has(item.product_id)}
                              onReviewSubmitted={() =>
                                setReviewedProductIds((prev) =>
                                  new Set(prev).add(item.product_id)
                                )
                              }
                            />
                          )}
                        </div>
                        <div className="text-sm font-bold text-primary">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-slate-50/50">
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
              ))}

              {/* Render Custom Products */}
              {filteredCustomProducts.map((product) => (
                <div
                  key={`custom-${product.id}`}
                  className="bg-white rounded shadow-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        Custom Product: {product.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-medium">
                        {product.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 border-b">
                    <div className="flex gap-4">
                      {product.images && product.images.length > 0 && (
                        <img
                          alt={product.name}
                          className="aspect-square rounded border-2 border-gray900 object-cover h-20 w-20"
                          src={product.images[0] || "/placeholder.jpg"}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm font-bold text-primary">
                        ₱{product.base_price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50">
                    <div className="flex justify-end items-center gap-4">
                      <span className="text-xs text-gray-500">
                        Custom Product Total:
                      </span>
                      <span className="text-xl font-bold text-primary">
                        ₱{product.base_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-gray-600 py-6 px-8 mt-32">
        <div className="text-center text-sm">
          <p>&copy; 2026 E-COM Group. All rights reserved.</p>
          <p className="mt-2">For educational purposes only, and no copyright infringement is intended.</p>
        </div>
      </footer>
    </div>
  );
}
