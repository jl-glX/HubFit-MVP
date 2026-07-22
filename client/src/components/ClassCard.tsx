import { Users, User, Clock, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
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
  const occupancy = Math.min(100, Math.round((bookedCount / maxCapacity) * 100));

  return (
    <Card className="group flex flex-col overflow-hidden border-slate-200/80 bg-white/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/8">
      <div className="h-1.5 bg-linear-to-r from-blue-600 via-indigo-500 to-cyan-400" />
      <div className="flex flex-1 flex-col space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-bold tracking-tight text-slate-950">{name}</h4>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${isFull ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
            {isFull ? "Waitlist" : `${availablePlaces} open`}
          </span>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><User size={15} /></span>
            <span>{trainerName}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Clock size={15} /></span>
            <span>
              {formatDate(scheduledAt)} at {formatTime(scheduledAt)}
            </span>
          </div>
        </div>

        <div className="mt-auto rounded-xl bg-slate-50 p-3.5">
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600"><Users size={14} /> Capacity</span>
            <span className="text-slate-900">{bookedCount} / {maxCapacity}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full rounded-full transition-all ${isFull ? "bg-amber-500" : "bg-linear-to-r from-blue-600 to-cyan-500"}`} style={{ width: `${occupancy}%` }} />
          </div>
          {isFull && waitlistCount > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700">
              <AlertCircle size={14} /> {waitlistCount} on waitlist
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 p-4 pt-3">
        {!isFuture ? (
          <Button disabled className="w-full rounded-xl" variant="outline">
            Class Finished
          </Button>
        ) : isBooked ? (
          <Button disabled className="w-full rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 opacity-100" variant="outline">
            <CheckCircle2 /> Booked
          </Button>
        ) : isFull ? (
          <Button
            onClick={onBookClick}
            disabled={isLoading}
            className="w-full rounded-xl border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
            variant="outline"
          >
            {isLoading ? "Adding to Waitlist..." : "Join Waitlist"}
          </Button>
        ) : (
          <Button
            onClick={onBookClick}
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 shadow-md shadow-blue-600/15 hover:bg-blue-700"
          >
            {isLoading ? "Booking..." : <><span>Book class</span><ArrowRight /></>}
          </Button>
        )}
      </div>
    </Card>
  );
}
