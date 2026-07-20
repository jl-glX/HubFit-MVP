import { Card } from "./ui/card";

interface OccupancyData {
  label: string;
  value: number;
  capacity: number;
}

interface OccupancyChartProps {
  title: string;
  data: OccupancyData[];
  maxWidth?: string;
}

export function OccupancyChart({
  title,
  data,
  maxWidth = "w-full",
}: OccupancyChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 100);

  return (
    <Card className={`p-6 ${maxWidth}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">No data available</p>
      ) : (
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium">
                  {item.value}/{item.capacity}
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
