import { Card } from "./ui/card";
import { formatDate, formatTime } from "../lib/dateUtils";

interface UpcomingBooking {
  id: string;
  classId: string;
  userId: string;
  status: string;
  createdAt: number;
  cancelledAt: number | null;
  name?: string;
  description?: string;
  scheduledAt?: number;
  maxCapacity?: number;
  trainerName?: string;
}

interface UpcomingBookingsListProps {
  title: string;
  data: any[];
  limit?: number;
}

export function UpcomingBookingsList({
  title,
  data,
  limit = 5,
}: UpcomingBookingsListProps) {
  const bookings = data.slice(0, limit);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {bookings.length === 0 ? (
        <p className="text-sm text-gray-400">No upcoming bookings</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking, index) => (
            <div
              key={booking.id || index}
              className="flex items-start justify-between pb-3 border-b border-gray-200 last:border-0"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{booking.name}</p>
                {booking.scheduledAt && (
                  <p className="text-xs text-gray-500">
                    {formatDate(booking.scheduledAt)} at{" "}
                    {formatTime(booking.scheduledAt)}
                  </p>
                )}
                {booking.trainerName && (
                  <p className="text-xs text-gray-400">
                    Trainer: {booking.trainerName}
                  </p>
                )}
              </div>
              <span className="text-xs font-medium text-blue-600 px-2 py-1 bg-blue-50 rounded">
                Confirmed
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
