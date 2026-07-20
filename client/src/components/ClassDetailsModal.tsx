import { Loader, AlertCircle, X, Download } from "lucide-react";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { useClassAttendees } from "../hooks/useClassAttendees";
import { useAuth } from "../hooks/useAuth";
import { formatDate, formatTime } from "../lib/dateUtils";

interface ClassDetailsModalProps {
  classId: string;
  className: string;
  scheduledAt: number;
  maxCapacity: number;
  bookedCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClassDetailsModal({
  classId,
  className,
  scheduledAt,
  maxCapacity,
  bookedCount,
  open,
  onOpenChange,
}: ClassDetailsModalProps) {
  const { attendees, waitlist, loading, error } = useClassAttendees(classId);
  const { user } = useAuth();

  const canExportCsv = user?.role === "trainer" || user?.role === "admin";

  const handleExportCsv = async () => {
    try {
      const response = await fetch(
        `/api/bookings/class/${classId}/export-csv`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendees-${className.toLowerCase().replace(/\s+/g, "-")}-${new Date(scheduledAt).toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Failed to export CSV");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-slate-900 line-clamp-2">
                {className}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {formatDate(scheduledAt)} at {formatTime(scheduledAt)}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Capacity Overview */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Capacity
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <span>Booked</span>
                  <span>
                    {bookedCount}/{maxCapacity}
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
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
                <p className="text-xs text-slate-600 mt-2">
                  {maxCapacity - bookedCount} spot
                  {maxCapacity - bookedCount !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-6 w-6 animate-spin text-slate-600 mr-2" />
                <span className="text-slate-600">Loading attendees...</span>
              </div>
            ) : (
              <>
                {/* Confirmed Attendees */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Confirmed Attendees ({attendees.length})
                  </h3>
                  {attendees.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                      <p className="text-sm text-gray-600">
                        No confirmed attendees yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {attendee.name}
                            </p>
                            <p className="text-sm text-slate-600 truncate">
                              {attendee.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Waitlist */}
                {waitlist.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Waitlist ({waitlist.length})
                    </h3>
                    <div className="space-y-2">
                      {waitlist.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50"
                        >
                          <div className="shrink-0 rounded-full bg-amber-200 w-6 h-6 flex items-center justify-center">
                            <span className="text-xs font-semibold text-amber-900">
                              {entry.position}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {entry.name}
                            </p>
                            <p className="text-sm text-slate-600 truncate">
                              {entry.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex gap-2">
            {canExportCsv && (
              <Button
                onClick={handleExportCsv}
                variant="outline"
                className="gap-2 flex-1"
              >
                <Download size={18} />
                Export CSV
              </Button>
            )}
            <Button
              onClick={() => onOpenChange(false)}
              className={canExportCsv ? "flex-1" : "w-full"}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
