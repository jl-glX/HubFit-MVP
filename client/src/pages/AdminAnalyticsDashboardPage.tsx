import { useState } from "react";
import { AlertCircle, Loader } from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import {
  useMemberMetrics,
  useClassPopularity,
  usePeakHours,
  useMonthlyMetrics,
} from "../hooks/useAnalytics";
import { MetricCard } from "../components/MetricCard";
import { PeriodSelector } from "../components/PeriodSelector";
import { PeakHoursChart } from "../components/PeakHoursChart";
import { ClassPopularityList } from "../components/ClassPopularityList";

type PeriodType = "day" | "week" | "month";

export function AdminAnalyticsDashboardPage() {
  const user = useCurrentUser();
  const [period, setPeriod] = useState<PeriodType>("month");
  const { data: memberMetrics, loading: membersLoading } = useMemberMetrics();
  const { data: classPopularity, loading: popularityLoading } =
    useClassPopularity();
  const { data: peakHours, loading: peakHoursLoading } = usePeakHours();

  // Get current month metrics
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const { data: monthlyMetrics, loading: monthlyLoading } = useMonthlyMetrics(
    year,
    month
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="mr-2 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
            <AlertCircle className="mx-auto mb-4 text-amber-600" size={48} />
            <p className="text-amber-800 font-medium">Access Denied</p>
            <p className="mt-2 text-sm text-amber-700">
              Only administrators can access this dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isLoading =
    membersLoading || popularityLoading || peakHoursLoading || monthlyLoading;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            System-wide metrics, usage and performance insights
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <PeriodSelector selectedPeriod={period} onPeriodChange={setPeriod} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="mr-2 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        ) : (
          <>
            {/* Member Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <MetricCard
                title="Total Members"
                value={memberMetrics?.totalMembers || 0}
                subtitle="Registered users"
              />
              <MetricCard
                title="Active Members"
                value={memberMetrics?.activeMembers || 0}
                subtitle="Last 30 days"
              />
              <MetricCard
                title="Joined This Week"
                value={memberMetrics?.memberJoinedThisWeek || 0}
                subtitle="New members"
              />
              <MetricCard
                title="Joined This Month"
                value={memberMetrics?.memberJoinedThisMonth || 0}
                subtitle="This month"
              />
            </div>

            {/* Monthly Metrics */}
            {monthlyMetrics && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <MetricCard
                  title="Total Bookings"
                  value={monthlyMetrics.totalBookings}
                  subtitle={`This month (${monthlyMetrics.month})`}
                />
                <MetricCard
                  title="Cancellations"
                  value={monthlyMetrics.totalCancellations}
                  subtitle={`This month`}
                />
                <MetricCard
                  title="Total Classes"
                  value={monthlyMetrics.totalClasses}
                  subtitle={`This month`}
                />
                <MetricCard
                  title="Avg. Occupancy"
                  value={`${monthlyMetrics.averageOccupancy}%`}
                  subtitle={`This month`}
                />
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Peak Hours */}
              <PeakHoursChart
                title="Gym Peak Hours"
                data={peakHours || []}
              />

              {/* Placeholder for other metrics */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">API Health</span>
                    <span className="text-xs font-medium text-green-600 px-2 py-1 bg-green-50 rounded">
                      Operational
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="text-xs font-medium text-green-600 px-2 py-1 bg-green-50 rounded">
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Classes */}
            {classPopularity && classPopularity.length > 0 && (
              <div className="mb-8">
                <ClassPopularityList
                  title="Most Popular Classes"
                  data={classPopularity}
                  limit={10}
                />
              </div>
            )}

            {/* No Data State */}
            {(!memberMetrics || memberMetrics.totalMembers === 0) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                <AlertCircle className="mx-auto mb-4 text-amber-600" size={40} />
                <p className="text-amber-800 font-medium">
                  No system data yet
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  Analytics will appear as users register and book classes
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
