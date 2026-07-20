import { Users, User, Clock, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { formatDate, formatTime, isFutureClass } from "../lib/dateUtils";

interface ClassCardProps {
  id: string;
  name: string;
  description: string;
  trainerName: string;
  scheduledAt: number;
  maxCapacity: number;
  bookedCount: number;
  availablePlaces: number;
  waitlistCount: number;
  onBookClick: () => void;
  isBooked: boolean;
  isLoading?: boolean;
}

export function ClassCard({
  name,
  description,
  trainerName,
  scheduledAt,
  maxCapacity,
  bookedCount,
  availablePlaces,
  waitlistCount,
  onBookClick,
  isBooked,
  isLoading = false,
}: ClassCardProps) {
  const isFuture = isFutureClass(scheduledAt);
  const isFull = availablePlaces === 0;

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="flex-1 space-y-4 p-4">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-500" />
            <span>{trainerName}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <span>
              {formatDate(scheduledAt)} at {formatTime(scheduledAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <span>
              {bookedCount}/{maxCapacity} booked
            </span>
          </div>

          {isFull && waitlistCount > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              <span className="text-amber-600">{waitlistCount} on waitlist</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t p-4">
        {!isFuture ? (
          <Button disabled className="w-full" variant="outline">
            Class Finished
          </Button>
        ) : isBooked ? (
          <Button disabled className="w-full" variant="outline">
            Booked
          </Button>
        ) : isFull ? (
          <Button
            onClick={onBookClick}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? "Adding to Waitlist..." : "Join Waitlist"}
          </Button>
        ) : (
          <Button
            onClick={onBookClick}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Booking..." : `Book (${availablePlaces} left)`}
          </Button>
        )}
      </div>
    </Card>
  );
}
