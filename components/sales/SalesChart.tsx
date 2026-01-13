import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface SalesChartProps {
  data: { date: string; revenue: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  console.log("SalesChart data:", data);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
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
                            Revenue : {`₱${payload[0].value}`}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="revenue" stroke="blue" strokeWidth={2} dot={true} connectNulls={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}