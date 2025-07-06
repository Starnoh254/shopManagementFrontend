import React, { useState, useEffect } from "react";
import Card from "../ui/Card";
import LoadingSpinner from "../ui/LoadingSpinner";
import { salesService } from "../../services/salesService";
import type { DashboardData, SalesAnalytics } from "../../types/sales";

interface SalesOverviewProps {
  onViewAllSales: () => void;
}

const SalesOverview: React.FC<SalesOverviewProps> = ({ onViewAllSales }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [dailySummary, setDailySummary] = useState<{
    summary: SalesAnalytics;
    hourlyBreakdown: Array<{
      hour: number;
      sales: number;
      revenue: number;
      profit: number;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load dashboard data and today's summary in parallel
      const [dashboard, daily] = await Promise.all([
        salesService.getDashboard(),
        salesService.getDailySummary(),
      ]);

      setDashboardData(dashboard);
      setDailySummary({
        summary: daily.summary,
        hourlyBreakdown: daily.hourlyBreakdown,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData || !dailySummary) {
    return (
      <div className="text-center py-12 text-gray-500">No data available</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dailySummary.summary.totalRevenue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">
                {formatPercentage(dashboardData.thisMonth.growth)}
              </p>
              <p className="text-xs text-gray-500">vs yesterday</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                {dailySummary.summary.totalSales}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">
                Avg: {formatCurrency(dailySummary.summary.averageOrderValue)}
              </p>
              <p className="text-xs text-gray-500">per sale</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Profit</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dailySummary.summary.totalProfit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-600">
                {(
                  (dailySummary.summary.totalProfit /
                    dailySummary.summary.totalRevenue) *
                  100
                ).toFixed(1)}
                %
              </p>
              <p className="text-xs text-gray-500">margin</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.quickStats.totalProducts}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-600">
                {dashboardData.quickStats.lowStockItems} low
              </p>
              <p className="text-xs text-gray-500">stock alerts</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Sales & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Sales
            </h3>
            <button
              onClick={onViewAllSales}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {dashboardData.recentSales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">Sale #{sale.id}</p>
                  <p className="text-sm text-gray-600">
                    {sale.customerName || "Walk-in Customer"}
                  </p>
                  <p className="text-xs text-gray-500">{sale.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(sale.amount)}
                  </p>
                  <p className="text-xs text-gray-500">{sale.items}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Products
            </h3>
            <span className="text-sm text-gray-500">This week</span>
          </div>

          <div className="space-y-3">
            {dashboardData.topSellingToday.slice(0, 5).map((product, index) => (
              <div
                key={`${product.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.quantitySold} sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Hourly Sales Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Sales by Hour
        </h3>
        <div className="grid grid-cols-12 gap-2 h-32">
          {Array.from({ length: 12 }, (_, i) => {
            const hour = i * 2; // 0, 2, 4, ..., 22
            const hourData = dailySummary.hourlyBreakdown.find(
              (h) => h.hour === hour
            );
            const revenue = hourData?.revenue || 0;
            const maxRevenue = Math.max(
              ...dailySummary.hourlyBreakdown.map((h) => h.revenue)
            );
            const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

            return (
              <div
                key={hour}
                className="flex flex-col items-center justify-end h-full"
              >
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-500"
                  style={{ height: `${height}%` }}
                  title={`${hour}:00 - ${formatCurrency(revenue)}`}
                />
                <span className="text-xs text-gray-500 mt-1">{hour}h</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default SalesOverview;
