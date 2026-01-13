'use client';

import { Line, LineChart, ResponsiveContainer } from "recharts";
import { mockChartData } from "@/lib/mock-data";

export function MinimalChart() {
  console.log("MinimalChart data:", mockChartData);
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockChartData}>
          <Line type="monotone" dataKey="revenue" stroke="blue" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}