import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
}

export function MetricCard({ title, value, change, changeLabel, icon }: MetricCardProps) {
  const changeType = change > 0 ? "increase" : "decrease";
  const changeColor = change > 0 ? "text-green-500" : "text-red-500";
  const arrowIcon = change > 0 ? "▲" : "▼";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[var(--green-custom)]">{value}</div>

      </CardContent>
    </Card>
  );
}