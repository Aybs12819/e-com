import { addDays } from "date-fns";

export const mockOrders = [
  {
    id: "ORD001",
    customerName: "John Doe",
    amount: 120.0,
    shippingFee: 10.0,
    status: "completed",
    date: "2026-01-01",
    products: [{ price: 50, quantity: 1 }, { price: 60, quantity: 1 }]
  },
  {
    id: "ORD002",
    customerName: "Jane Smith",
    amount: 200.0,
    shippingFee: 15.0,
    status: "pending",
    date: "2026-01-02",
    products: [{ price: 100, quantity: 2 }]
  },
  {
    id: "ORD003",
    customerName: "Peter Jones",
    amount: 75.0,
    shippingFee: 5.0,
    status: "completed",
    date: "2026-01-03",
    products: [{ price: 75, quantity: 1 }]
  },
  {
    id: "ORD004",
    customerName: "Alice Brown",
    amount: 300.0,
    shippingFee: 20.0,
    status: "completed",
    date: "2026-01-04",
    products: [{ price: 150, quantity: 2 }]
  },
  {
    id: "ORD005",
    customerName: "Robert White",
    amount: 50.0,
    shippingFee: 5.0,
    status: "cancelled",
    date: "2026-01-05",
    products: [{ price: 50, quantity: 1 }]
  },
  {
    id: "ORD006",
    customerName: "Maria Green",
    amount: 150.0,
    shippingFee: 10.0,
    status: "completed",
    date: "2026-01-06",
    products: [{ price: 75, quantity: 2 }]
  },
  {
    id: "ORD007",
    customerName: "David Black",
    amount: 400.0,
    shippingFee: 25.0,
    status: "pending",
    date: "2026-01-07",
    products: [{ price: 200, quantity: 2 }]
  },
  {
    id: "ORD008",
    customerName: "Laura Blue",
    amount: 90.0,
    shippingFee: 8.0,
    status: "completed",
    date: "2026-01-08",
    products: [{ price: 45, quantity: 2 }]
  },
  {
    id: "ORD009",
    customerName: "James Red",
    amount: 180.0,
    shippingFee: 12.0,
    status: "completed",
    date: "2026-01-09",
    products: [{ price: 60, quantity: 3 }]
  },
  {
    id: "ORD010",
    customerName: "Olivia Yellow",
    amount: 250.0,
    shippingFee: 18.0,
    status: "pending",
    date: "2026-01-10",
    products: [{ price: 125, quantity: 2 }]
  },
];

export const mockChartData = [
  { date: "Jan 01", revenue: 4400 },
  { date: "Jan 02", revenue: 3800 },
  { date: "Jan 03", revenue: 4800 },
  { date: "Jan 04", revenue: 4200 },
  { date: "Jan 05", revenue: 3500 },
  { date: "Jan 06", revenue: 4900 },
  { date: "Jan 07", revenue: 5650 },
  { date: "Jan 08", revenue: 5200 },
  { date: "Jan 09", revenue: 4800 },
  { date: "Jan 10", revenue: 5500 },
];

export const initialDateRange = {
  from: addDays(new Date(), -9),
  to: new Date(),
};