'use client'

import { AdminSidebar } from "@/components/admin/sidebar"
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  BarChart3,
  Coins,
  ShoppingCart,
  Users,
} from "lucide-react";
import { MetricCard } from "@/components/sales/MetricCard";
import { SalesChart } from "@/components/sales/SalesChart";
import { ExportButtons } from "@/components/sales/ExportButtons";
import { DateRangePicker } from "@/components/sales/DateRangePicker";
import { calculateMetrics, fetchSalesData, fetchSalesChartData } from "@/lib/utils";
import { Order } from "@/lib/types";

const initialDateRange = {
  from: new Date(new Date().setDate(new Date().getDate() - 7)),
  to: new Date(),
};

const Index = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const fetchedOrders = await fetchSalesData(dateRange);
      setOrders(fetchedOrders);
      const fetchedChartData = await fetchSalesChartData(dateRange);
      setChartData(fetchedChartData);
      setLoading(false);
    };
    getData();
  }, [dateRange]);

  const {
    totalGross,
    totalNet,
    totalOrders,
    avgOrderValueWithoutShipping,
  } = calculateMetrics(orders, dateRange);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="ml-64 flex-1 p-8">
          <p>Loading sales data...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Sales Report</h1>
                <p className="text-muted-foreground">Track your e-commerce performance</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <DateRangePicker date={dateRange} setDate={setDateRange} />
                <ExportButtons 
                  orders={orders} 
                  chartData={chartData} 
                  metrics={{ totalGross, totalOrders, avgOrderValueWithoutShipping, totalNet }} 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard
              title="Total Gross"
              value={`₱${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              change={12.5}
              changeLabel="vs last period"
              icon={<Coins className="h-5 w-5" />}
            />
            <MetricCard
              title="Total Orders"
              value={totalOrders.toString()}
              change={8.2}
              changeLabel="vs last period"
              icon={<ShoppingCart className="h-5 w-5" />}
            />
            <MetricCard
              title="Average Order Value"
              value={`₱${avgOrderValueWithoutShipping.toFixed(2)}`}
              change={4.1}
              changeLabel="vs last period"
              icon={<BarChart3 className="h-5 w-5" />}
            />
            <MetricCard
              title="Total Net"
              value={`₱${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              change={-0.8}
              changeLabel="vs last period"
              icon={<Users className="h-5 w-5" />}
            />
          </div>

          {/* Chart */}
          <div className="mb-8">
          <SalesChart data={chartData} />
        </div>

          
        </div>
      </main>
    </div>
  );
};

export default Index;