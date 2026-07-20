import { Card } from "./ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
}: MetricCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        {icon && <div className="text-blue-600">{icon}</div>}
      </div>
      {trend && (
        <div
          className={`mt-3 flex items-center text-sm font-medium ${
            trend.direction === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{trend.direction === "up" ? "↑" : "↓"} {trend.value}%</span>
        </div>
      )}
    </Card>
  );
}
