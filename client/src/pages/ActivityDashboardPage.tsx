import { useState, useMemo } from "react";
import { AlertCircle, Loader } from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import {
  useUserActivityMetrics,
  useUpcomingBookings,
  usePeakHours,
  useClassPopularity,
} from "../hooks/useAnalytics";
import { MetricCard } from "../components/MetricCard";
import { PeriodSelector } from "../components/PeriodSelector";
import { UpcomingBookingsList } from "../components/UpcomingBookingsList";
import { PeakHoursChart } from "../components/PeakHoursChart";
import { ClassPopularityList } from "../components/ClassPopularityList";

type PeriodType = "day" | "week" | "month";

export function ActivityDashboardPage() {
  const user = useCurrentUser();
  const [period, setPeriod] = useState<PeriodType>("week");
  const { data: activityMetrics, loading: metricsLoading } =
    useUserActivityMetrics(user?.id || "");
  const { data: upcomingBookings, loading: bookingsLoading } =
    useUpcomingBookings(user?.id || "");
  const { data: peakHours, loading: peakHoursLoading } = usePeakHours();
  const { data: classPopularity, loading: popularityLoading } =
    useClassPopularity();

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="mr-2 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  const isLoading =
    metricsLoading || bookingsLoading || peakHoursLoading || popularityLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Activity Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Your bookings, metrics and gym activity
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <PeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
        </div>

        {/* Key Metrics */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="mr-2 animate-spin" />
            <span>Loading metrics...</span>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <MetricCard
                title="Total Bookings"
                value={activityMetrics?.totalBookings || 0}
                subtitle="All time"
              />
              <MetricCard
                title="Confirmed"
                value={activityMetrics?.confirmedBookings || 0}
                subtitle="Active reservations"
              />
              <MetricCard
                title="Cancelled"
                value={activityMetrics?.cancelledBookings || 0}
                subtitle="Cancelled bookings"
              />
              <MetricCard
                title="Upcoming"
                value={activityMetrics?.upcomingBookings || 0}
                subtitle="Next reservations"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Upcoming Bookings */}
              <UpcomingBookingsList
                title="Next Classes"
                data={upcomingBookings || []}
                limit={5}
              />

              {/* Peak Hours */}
              <PeakHoursChart
                title="Peak Hours"
                data={peakHours || []}
              />
            </div>

            {/* Popular Classes */}
            {classPopularity && classPopularity.length > 0 && (
              <div className="mb-8">
                <ClassPopularityList
                  title="Most Popular Classes"
                  data={classPopularity}
                  limit={5}
                />
              </div>
            )}

            {/* No Data State */}
            {(!activityMetrics ||
              activityMetrics.totalBookings === 0) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                <AlertCircle className="mx-auto mb-4 text-amber-600" size={40} />
                <p className="text-amber-800 font-medium">
                  No booking data yet
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  Start booking classes to see your activity metrics
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
