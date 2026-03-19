"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client"; // Corrected import
import { useRouter } from "next/navigation";
import Script from "next/script";
import { toast } from "@/hooks/use-toast"; // Explicitly import toast

interface OrderDetailsProps {
  params: {
    orderId: string;
  };
}

interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  shipping_address: {
    street: string;
    city: string;
    zip: string;
    state?: string;
    country?: string;
  };
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  variation_id: string | null;
  // Add other fields as per your order_items schema
}

export default function OrderDetailsPage({ params }: OrderDetailsProps) {
  const { orderId } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const supabase = createClient(); // Removed this line
  const router = useRouter();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            order_items (
              id,
              product_id,
              quantity,
              price,
              variation_id
            )
          `
          )
          .eq("id", orderId)
          .single();

        if (error) {
          console.error("Error fetching order details:", error);
          setError(error.message);
          toast({
            title: "Error fetching order details",
            description: error.message,
            variant: "destructive",
          });
        } else if (data) {
          setOrder(data as Order);
        }
      } catch (err: any) {
        console.error("An unexpected error occurred:", err);
        setError(err.message || "An unexpected error occurred.");
        toast({
          title: "An unexpected error occurred",
          description: err.message || "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, supabase, router]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading order details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (!order) {
    return <div className="container mx-auto p-4">Order not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p>
          <strong>Order ID:</strong> {order.id}
        </p>
        <p>
          <strong>Customer ID:</strong> {order.customer_id}
        </p>
        <p>
          <strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}
        </p>
        <h2 className="text-xl font-semibold mt-6 mb-3">Shipping Address</h2>
        {order.shipping_address ? (
          <div>
            <p>{order.shipping_address.street}</p>
            <p>
              {order.shipping_address.city}, {order.shipping_address.state}{" "}
              {order.shipping_address.zip}
            </p>
            <p>{order.shipping_address.country}</p>
          </div>
        ) : (
          <p>No shipping address provided.</p>
        )}

        <h2 className="text-xl font-semibold mt-6 mb-3">Order Items</h2>
        {order.order_items && order.order_items.length > 0 ? (
          <ul>
            {order.order_items.map((item) => (
              <li key={item.id} className="mb-2 p-3 border rounded-md">
                <p>
                  <strong>Product ID:</strong> {item.product_id}
                </p>
                <p>
                  <strong>Quantity:</strong> {item.quantity}
                </p>
                <p>
                  <strong>Price:</strong> ${item.price.toFixed(2)}
                </p>
                {item.variation_id && (
                  <p>
                    <strong>Variation ID:</strong> {item.variation_id}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No items in this order.</p>
        )}
      </div>
    </div>
  );
}