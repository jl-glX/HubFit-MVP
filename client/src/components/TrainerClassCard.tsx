import { Clock, Users, AlertCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { formatDate, formatTime } from "../lib/dateUtils";

interface TrainerClassCardProps {
  id: string;
  name: string;
  scheduledAt: number;
  maxCapacity: number;
  bookedCount: number;
  availablePlaces: number;
  waitlistCount: number;
  onClick: () => void;
}

export function TrainerClassCard({
  name,
  scheduledAt,
  maxCapacity,
  bookedCount,
  availablePlaces,
  waitlistCount,
  onClick,
}: TrainerClassCardProps) {
  const isFull = availablePlaces === 0;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
      <div
        className="p-4 sm:p-6"
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClick();
          }
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-lg text-slate-900 line-clamp-2">
            {name}
          </h3>
          {isFull && (
            <div className="shrink-0 rounded-full bg-red-100 p-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Clock size={16} className="shrink-0" />
            <span>
              {formatDate(scheduledAt)} at {formatTime(scheduledAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={16} className="shrink-0" />
            <span>
              {bookedCount}/{maxCapacity} attendees
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-700">
            <span>Capacity</span>
            <span>{bookedCount}/{maxCapacity}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                bookedCount >= maxCapacity
                  ? "bg-red-500"
                  : bookedCount >= maxCapacity * 0.8
                    ? "bg-amber-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${(bookedCount / maxCapacity) * 100}%` }}
            />
          </div>
        </div>

        {waitlistCount > 0 && (
          <div className="mt-3 p-2 bg-amber-50 rounded-md">
            <p className="text-xs text-amber-800">
              {waitlistCount} {waitlistCount === 1 ? "person" : "people"} on
              waitlist
            </p>
          </div>
        )}

        <Button
          onClick={onClick}
          className="w-full mt-4"
          variant="outline"
          size="sm"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}
