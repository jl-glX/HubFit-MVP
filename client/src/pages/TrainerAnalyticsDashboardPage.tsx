import { AlertCircle, Loader } from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import {
  useTrainerActivityMetrics,
  useTrainerUpcomingClasses,
  useClassPopularity,
  usePeakHours,
} from "../hooks/useAnalytics";
import { MetricCard } from "../components/MetricCard";
import { UpcomingBookingsList } from "../components/UpcomingBookingsList";
import { PeakHoursChart } from "../components/PeakHoursChart";
import { ClassPopularityList } from "../components/ClassPopularityList";

export function TrainerAnalyticsDashboardPage() {
  const user = useCurrentUser();
  const { data: trainerMetrics, loading: metricsLoading } =
    useTrainerActivityMetrics(user?.id || "");
  const { data: upcomingClasses, loading: classesLoading } =
    useTrainerUpcomingClasses(user?.id || "");
  const { data: allClassPopularity, loading: popularityLoading } =
    useClassPopularity();
  const { data: peakHours, loading: peakHoursLoading } = usePeakHours();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="mr-2 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (user.role !== "trainer") {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
            <AlertCircle className="mx-auto mb-4 text-amber-600" size={48} />
            <p className="text-amber-800 font-medium">Access Denied</p>
            <p className="mt-2 text-sm text-amber-700">
              Only trainers can access this dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isLoading =
    metricsLoading || classesLoading || popularityLoading || peakHoursLoading;

  // Filter popular classes by this trainer
  const trainerPopularClasses =
    allClassPopularity?.filter((cls) => {
      const upcomingClass = upcomingClasses?.find(
        (uc) => uc.id === cls.classId
      );
      return upcomingClass !== undefined;
    }) || [];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Trainer Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            Your classes, attendance and gym insights
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="mr-2 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <MetricCard
                title="Total Classes"
                value={trainerMetrics?.totalClasses || 0}
                subtitle="All classes created"
              />
              <MetricCard
                title="Total Bookings"
                value={trainerMetrics?.totalBookings || 0}
                subtitle="Across all classes"
              />
              <MetricCard
                title="Avg. Occupancy"
                value={`${trainerMetrics?.averageOccupancy || 0}%`}
                subtitle="Class capacity"
              />
              <MetricCard
                title="Unique Members"
                value={trainerMetrics?.totalMembers || 0}
                subtitle="Registered participants"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Upcoming Classes */}
              <UpcomingBookingsList
                title="Your Next Classes"
                data={
                  upcomingClasses?.map((cls) => ({
                    ...cls,
                    name: cls.name,
                    trainerName: cls.trainerName,
                  })) || []
                }
                limit={5}
              />

              {/* Peak Hours */}
              <PeakHoursChart
                title="Gym Peak Hours"
                data={peakHours || []}
              />
            </div>

            {/* Trainer's Popular Classes */}
            {trainerPopularClasses.length > 0 && (
              <div className="mb-8">
                <ClassPopularityList
                  title="Your Most Popular Classes"
                  data={trainerPopularClasses}
                  limit={5}
                />
              </div>
            )}

            {/* No Data State */}
            {(!trainerMetrics || trainerMetrics.totalClasses === 0) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                <AlertCircle className="mx-auto mb-4 text-amber-600" size={40} />
                <p className="text-amber-800 font-medium">
                  No classes created yet
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  Create classes to see analytics and attendance metrics
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
