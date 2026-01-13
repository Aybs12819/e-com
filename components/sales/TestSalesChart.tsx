'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { mockChartData } from "@/lib/mock-data";

export function TestSalesChart() {
  console.log("TestSalesChart data:", mockChartData);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview (Test)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart width={500} height={300} data={mockChartData}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} domain={[0, 6000]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-1">
                            <p className="text-sm text-muted-foreground">
                              {payload[0].payload.date}
                            </p>
                            <p className="text-sm">
                              Revenue : {`$${payload[0].value}`}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <Line dataKey="revenue" stroke="red" dot={true} />
              </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}