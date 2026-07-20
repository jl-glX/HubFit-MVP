import { useState } from "react";
import { AlertCircle, Loader, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { ClassCard } from "../components/ClassCard";
import { useClasses } from "../hooks/useClasses";
import { useBookings } from "../hooks/useBookings";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { groupClassesByDate } from "../lib/dateUtils";

export function ClassesPage() {
  const user = useCurrentUser();
  const { classes, loading: classesLoading, error: classesError, refreshClasses } = useClasses();
  const { bookings, bookClass } = useBookings(user?.id || "");
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState<string | null>(null);

  const userBookedClassIds = new Set(bookings.map((b) => b.classId));
  const groupedClasses = groupClassesByDate(classes);
  const sortedDates = Object.keys(groupedClasses).sort();

  const handleBook = async (classId: string) => {
    if (!user?.id) return;

    try {
      setBookingError(null);
      setBookingInProgress(classId);
      await bookClass(classId);
      await refreshClasses();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setBookingError(message);
    } finally {
      setBookingInProgress(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="mr-2 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Available Classes</h1>
            <p className="mt-2 text-gray-600">Book your gym classes</p>
          </div>
          <Button
            onClick={refreshClasses}
            disabled={classesLoading}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </Button>
        </div>

        {/* Error Messages */}
        {classesError && (
          <div className="mb-6 flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <AlertCircle className="text-red-600" />
            <p className="text-red-800">{classesError}</p>
          </div>
        )}

        {bookingError && (
          <div className="mb-6 flex flex-col items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
            <AlertCircle className="text-amber-600" />
            <p className="text-amber-800">{bookingError}</p>
          </div>
        )}

        {/* Loading State */}
        {classesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="mr-2 animate-spin" size={32} />
            <span className="text-lg">Loading classes...</span>
          </div>
        ) : classes.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
            <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">No classes available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date}>
                <h2 className="mb-4 text-2xl font-bold text-slate-800">{date}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedClasses[date].map((gymClass) => (
                    <ClassCard
                      key={gymClass.id}
                      id={gymClass.id}
                      name={gymClass.name}
                      description={gymClass.description}
                      trainerName={gymClass.trainerName}
                      scheduledAt={gymClass.scheduledAt}
                      maxCapacity={gymClass.maxCapacity}
                      bookedCount={gymClass.bookedCount}
                      availablePlaces={gymClass.availablePlaces}
                      waitlistCount={gymClass.waitlistCount}
                      onBookClick={() => handleBook(gymClass.id)}
                      isBooked={userBookedClassIds.has(gymClass.id)}
                      isLoading={bookingInProgress === gymClass.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
