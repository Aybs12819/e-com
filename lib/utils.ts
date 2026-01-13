import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DateRange } from "react-day-picker";
import { supabase } from './supabase/client';
import { Order } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateMetrics(orders: Order[], dateRange: DateRange | undefined) {
  const filteredOrders = orders.filter((order) => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const orderDate = new Date(order.created_at);
    // Set hours to 0 to compare dates only
    orderDate.setHours(0, 0, 0, 0);
    const fromDate = new Date(dateRange.from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(dateRange.to);
    toDate.setHours(0, 0, 0, 0);

    return orderDate >= fromDate && orderDate <= toDate;
  });

  const totalGross = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount) + parseFloat(order.shipping_fee), 0);
  const totalNet = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

  const totalOrders = filteredOrders.length;

  const avgOrderValueWithoutShipping = totalOrders > 0 ? totalNet / totalOrders : 0;

  // Placeholder for conversion rate calculation
  const conversionRate = 3.2; // Example value

  return {
    totalGross,
    totalNet,
    totalOrders,
    avgOrderValueWithoutShipping,
    conversionRate,
  };
}

export async function fetchSalesData(dateRange: DateRange | undefined): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('created_at, total_amount, shipping_fee');

  if (dateRange?.from) {
    query = query.gte('created_at', dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    query = query.lte('created_at', dateRange.to.toISOString());
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }

  return data as Order[];
}

export async function fetchSalesChartData(dateRange: DateRange | undefined) {
  let query = supabase
    .from('orders')
    .select('created_at, total_amount');

  if (dateRange?.from) {
    query = query.gte('created_at', dateRange.from.toISOString().split('T')[0]);
  }
  if (dateRange?.to) {
    query = query.lte('created_at', dateRange.to.toISOString().split('T')[0]);
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }

  // Aggregate data by date
  const aggregatedData: Record<string, number> = data.reduce((acc: Record<string, number>, order) => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += parseFloat(order.total_amount);
    return acc;
  }, {});

  return Object.keys(aggregatedData).map(date => ({
    date,
    revenue: aggregatedData[date],
  }));
}
