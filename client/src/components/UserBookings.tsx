import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AlertCircle, Loader, Trash2, Clock, User } from "lucide-react";
import { formatDateTime, isFutureClass } from "../lib/dateUtils";

interface UserBooking {
  id: string;
  classId: string;
  status: "confirmed" | "cancelled" | "waitlist";
  createdAt: number;
  name: string;
  scheduledAt: number;
  trainerName: string;
}

interface UserBookingsProps {
  userId: string;
}

export function UserBookings({ userId }: UserBookingsProps) {
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/bookings/user/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      // Filter out cancelled bookings
      setBookings(data.filter((b: UserBooking) => b.status !== "cancelled"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      setCancelling(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel booking");
      }

      await fetchBookings();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="mr-2 animate-spin" />
        <span>Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <AlertCircle className="text-red-600" />
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center">
        <p className="text-gray-600">No active bookings</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <Card key={booking.id} className="flex items-center justify-between p-4">
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold">{booking.name}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User size={14} />
                {booking.trainerName}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                {formatDateTime(booking.scheduledAt)}
              </div>
            </div>
            {booking.status === "waitlist" && (
              <div className="inline-block rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                On Waitlist
              </div>
            )}
          </div>

          {isFutureClass(booking.scheduledAt) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCancel(booking.id)}
              disabled={cancelling === booking.id}
              className="ml-4"
            >
              <Trash2 size={18} />
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
