import { Card } from "./ui/card";

interface PeakHourData {
  hour: number;
  bookingCount: number;
  classCount: number;
}

interface PeakHoursChartProps {
  title: string;
  data: PeakHourData[];
}

export function PeakHoursChart({ title, data }: PeakHoursChartProps) {
  const sortedData = [...data].sort((a, b) => a.hour - b.hour);
  const maxBookings = Math.max(...sortedData.map((d) => d.bookingCount), 1);

  const formatHour = (hour: number) => {
    return `${String(hour).padStart(2, "0")}:00`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {sortedData.length === 0 ? (
        <p className="text-sm text-gray-400">No data available</p>
      ) : (
        <div className="flex items-end gap-1 h-32">
          {sortedData.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full bg-blue-500 rounded-t transition-all duration-300"
                style={{
                  height: `${(item.bookingCount / maxBookings) * 120}px`,
                  minHeight: "4px",
                }}
                title={`${item.bookingCount} bookings at ${formatHour(item.hour)}`}
              />
              <span className="text-xs text-gray-500">
                {formatHour(item.hour)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
