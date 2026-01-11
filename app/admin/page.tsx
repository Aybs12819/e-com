"use client"

import { Button } from "@/components/ui/button"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Users, Truck, ShoppingBag, ShoppingCart, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const supabaseClient = supabase;
  const [stats, setStats] = useState([
    { label: "Total Products", value: "0", icon: Package, color: "text-blue-600" },
    { label: "Active Customers", value: "0", icon: Users, color: "text-emerald-600" },
    { label: "Pending Deliveries", value: "0", icon: Truck, color: "text-amber-600" },
    { label: "Daily Orders", value: "0", icon: ShoppingCart, color: "text-purple-600" },
  ]);

  interface LowStockProduct {
    productId: string;
    productName: string;
    combination: string;
    stock: number;
  }

  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

  interface CustomerAccount {
    id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    email: string | null;
    phone: string | null;
  }

  interface RecentOrder {
    id: string
    created_at: string
    status: string
    total_amount: string
    customer_id: string | null;
    customer_accounts: CustomerAccount[] | null
  }

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  useEffect(() => {
    const fetchStats = async () => {

      const { data: { user } } = await supabase.auth.getUser()

console.log(user?.app_metadata)
      // Fetch Total Products
      const { count: totalProducts } = await supabaseClient
        .from('products')
        .select('id', { count: 'exact' });

      // Fetch Active Customers with error handling for debugging
      const { data: customerAccountsData, error: customerError } = await supabaseClient
        .from('customer_accounts')
        .select('id');

      const activeCustomers = customerAccountsData?.length || 0;

      // Debug logs for server terminal (check terminal output for issues)
      if (customerError) {
        console.error('Failed to fetch customer accounts:', customerError.message);
      } else if (customerAccountsData === null) {
        console.warn('Customer accounts data returned null (check table permissions or query syntax)');
      } else {
        console.log('Customer accounts data:', customerAccountsData);
        console.log('Active Customers count:', activeCustomers);
      }

      // Fallback to 'N/A' if count is null/zero to indicate query issues
      const formattedCustomerCount = activeCustomers !== null ? activeCustomers.toString() : 'N/A';

      // Fetch Pending Deliveries
      const { count: pendingDeliveries } = await supabaseClient
        .from('orders')
        .select('*', { count: 'exact' })


      // Fetch Daily Orders and sum their total
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: dailyOrdersData } = await supabaseClient
        .from('orders')
        .select('total_amount')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      const dailyOrdersTotal =
        dailyOrdersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const { data: productsData, error: productsError } = await supabaseClient
        .from("products")
        .select("id, name, variant_combinations");

      if (productsError) {
        console.error("Error fetching products:", productsError);
      } else {
        const lowStock: LowStockProduct[] = [];
        productsData.forEach((product) => {
          if (product.variant_combinations) {
            const variants = product.variant_combinations as unknown as {
              price: number;
              stock: number;
              combination: string;
            }[];
            variants.forEach((variant) => {
              if (variant.stock <= 5) {
                lowStock.push({
                  productId: product.id,
                  productName: product.name,
                  combination: variant.combination,
                  stock: variant.stock,
                });
              }
            });
          }
        });
        setLowStockProducts(lowStock);
      }

      // Fetch Recent Orders with Customer Info
      const { data: recentOrdersData, error: recentOrdersError } = await supabaseClient
        .from("orders")
        .select(`id, created_at, status, total_amount, customer_id`)
        .order("created_at", { ascending: false })
        .limit(6)


      if (recentOrdersError) {
        console.error("Error fetching recent orders:", recentOrdersError)
        return;
      }

      // Extract customer IDs
      const customerIds = recentOrdersData?.map(order => order.customer_id).filter(Boolean) || [];

      // Fetch all customers at once
      const { data: customersData } = await supabaseClient
        .from("customer_accounts")
        .select("id, first_name, middle_name, last_name, email, phone")
        .in("id", customerIds); // Map orders to include customer info
      const formattedOrders = recentOrdersData?.map((order: any) => {
        const customer = customersData?.find(c => c.id === order.customer_id) ?? null;

        return {
          ...order,
          customer_accounts: customer ? [customer] : null
        };
      });
      setRecentOrders(formattedOrders || []);

      setStats([
        { label: "Total Products", value: totalProducts?.toString() || '0', icon: Package, color: "text-blue-600" },
        { label: "Active Customers", value: formattedCustomerCount, icon: Users, color: "text-emerald-600" },
        { label: "Pending Deliveries", value: pendingDeliveries?.toString() || '0', icon: Truck, color: "text-amber-600" },
        { label: "Daily Orders", value: `₱${dailyOrdersTotal.toLocaleString()}`, icon: ShoppingCart, color: "text-purple-600" },
      ]);
    };

    fetchStats();
  }, [supabaseClient]);

  const handleRestock = (productId: string) => {
    console.log(`Restock button clicked for product ID: ${productId}`);
    // TODO: Implement actual restock logic (e.g., open a dialog, update stock via API)
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[300px]">
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>

                    <TableHead className="hidden xl:table-column">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-column lg:table-column">
                      Date
                    </TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => {
                    const customer = order.customer_accounts?.[0] ?? null
                    let fullName = 'Unknown Customer'; // Default to Unknown Customer
                    let contact = 'No contact info available'; // Default contact info

                    if (customer) {
                      const customerNameParts = [customer.first_name, customer.middle_name, customer.last_name].filter(Boolean);
                      if (customerNameParts.length > 0) {
                        fullName = customerNameParts.join(' ');
                      }
                      contact = customer.email || customer.phone || 'No contact info available';
                    }

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{fullName}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {contact}
                          </div>
                        </TableCell>

                        <TableCell className="hidden xl:table-column">
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

                        <TableCell className="hidden md:table-column lg:table-column">
                          {new Date(order.created_at).toLocaleDateString("en-PH")}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          ₱{Number(order.total_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[300px]">
              {lowStockProducts.length > 0 ? (
                Object.entries(
                  lowStockProducts.reduce((acc, item) => {
                    (acc[item.productName] = acc[item.productName] || []).push(item);
                    return acc;
                  }, {} as Record<string, LowStockProduct[]>)
                ).map(([productName, items]) => (
                  <div key={productName} className="mb-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{productName}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestock(items[0].productId)}
                        className="flex items-center hover:bg-yellow-100 hover:text-black"
                      >
                          <span className="animate-pulse text-red-500">Restock</span>
                          <AlertTriangle className="ml-2 h-4 w-4 text-red-500 animate-pulse" />
                      </Button>
                    </div>
                    {items.map((item, index) => (
                      <div key={index} className="ml-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Low Stock: {item.stock} items left ({item.combination})
                        </p>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No low stock alerts.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
