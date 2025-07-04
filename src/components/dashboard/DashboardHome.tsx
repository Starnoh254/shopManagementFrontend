import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { customerService } from "../../services/customerService";
import { debtService } from "../../services/debtService";
import { paymentService } from "../../services/paymentService";
import type { Debt } from "../../services/debtService";
import type { Payment } from "../../services/paymentService";
import Card from "../ui/Card";
import LoadingState from "../ui/LoadingState";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";

interface DashboardStats {
  totalCustomers: number;
  customersWithDebts: number;
  totalOutstandingDebt: number;
  overdueDebts: number;
  paymentsToday: number;
}

const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    customersWithDebts: 0,
    totalOutstandingDebt: 0,
    overdueDebts: 0,
    paymentsToday: 0,
  });
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [overdueDebts, setOverdueDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation handlers for Quick Actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "add-customer":
        navigate("/dashboard/customers?action=create");
        break;
      case "add-debt":
        navigate("/dashboard/debts?action=create");
        break;
      case "record-payment":
        navigate("/dashboard/payments?action=create");
        break;
      case "view-reports":
        navigate("/dashboard/reports");
        break;
      default:
        break;
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [customers, customersWithDebts, overdue] = await Promise.all([
        customerService.getAll(),
        customerService.getWithDebts(),
        debtService.getOverdue(),
      ]);

      // Calculate stats
      const totalOutstandingDebt = customersWithDebts.reduce(
        (sum, customer) => sum + (customer.totalDebt || 0),
        0
      );

      // For recent payments, we'll get payments from customers with recent activity
      // Since there's no general getAll for payments, we'll get from first few customers
      let recentPayments: Payment[] = [];
      if (customers.length > 0) {
        try {
          // Get payments from the first few customers to show recent activity
          const paymentPromises = customers
            .slice(0, 3)
            .map((customer) =>
              paymentService.getCustomerPayments(customer.id).catch(() => [])
            );
          const customerPayments = await Promise.all(paymentPromises);
          recentPayments = customerPayments
            .flat()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 5);
        } catch (error) {
          console.log("Could not fetch recent payments:", error);
        }
      }

      const today = new Date().toDateString();
      const paymentsToday = recentPayments.filter(
        (payment) => new Date(payment.createdAt).toDateString() === today
      ).length;

      setStats({
        totalCustomers: customers.length,
        customersWithDebts: customersWithDebts.length,
        totalOutstandingDebt,
        overdueDebts: overdue.length,
        paymentsToday,
      });

      setRecentPayments(recentPayments);
      setOverdueDebts(overdue.slice(0, 5)); // Top 5 overdue debts
    } catch (err) {
      const message =
        err instanceof Error &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : "Failed to load dashboard data";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <LoadingState
        isLoading={true}
        loadingText="Loading dashboard..."
        children={null}
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Failed to load dashboard"
        description={error}
        action={<Button onClick={fetchDashboardData}>Try Again</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-light dark:text-primary-dark">
              {stats.totalCustomers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Customers
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.customersWithDebts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              With Outstanding Debts
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(stats.totalOutstandingDebt)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Outstanding
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {stats.overdueDebts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Overdue Debts
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.paymentsToday}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Payments Today
            </div>
          </div>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Payments
            </h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate("/dashboard/payments")}
            >
              View All
            </Button>
          </div>

          {recentPayments.length === 0 ? (
            <EmptyState
              icon="💳"
              title="No recent payments"
              description="Payments will appear here as they're recorded"
            />
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {payment.customerName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {payment.method} • {formatDate(payment.createdAt)}
                    </div>
                  </div>
                  <div className="text-green-600 dark:text-green-400 font-medium">
                    {formatCurrency(payment.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Overdue Debts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Overdue Debts
            </h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate("/dashboard/debts")}
            >
              View All
            </Button>
          </div>

          {overdueDebts.length === 0 ? (
            <EmptyState
              icon="✅"
              title="No overdue debts"
              description="Great! All debts are up to date"
            />
          ) : (
            <div className="space-y-3">
              {overdueDebts.map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {debt.customerName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Due: {formatDate(debt.dueDate)}
                    </div>
                  </div>
                  <div className="text-red-600 dark:text-red-400 font-medium">
                    {formatCurrency(debt.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Button
            className="h-16 sm:h-20 flex flex-col items-center justify-center text-xs sm:text-sm"
            onClick={() => handleQuickAction("add-customer")}
          >
            <span className="text-lg sm:text-2xl mb-1">👥</span>
            <span>Add Customer</span>
          </Button>
          <Button
            className="h-16 sm:h-20 flex flex-col items-center justify-center text-xs sm:text-sm"
            onClick={() => handleQuickAction("add-debt")}
          >
            <span className="text-lg sm:text-2xl mb-1">💰</span>
            <span>Add Debt</span>
          </Button>
          <Button
            className="h-16 sm:h-20 flex flex-col items-center justify-center text-xs sm:text-sm"
            variant="success"
            onClick={() => handleQuickAction("record-payment")}
          >
            <span className="text-lg sm:text-2xl mb-1">💳</span>
            <span>Record Payment</span>
          </Button>
          <Button
            className="h-16 sm:h-20 flex flex-col items-center justify-center text-xs sm:text-sm"
            variant="secondary"
            onClick={() => handleQuickAction("view-reports")}
          >
            <span className="text-lg sm:text-2xl mb-1">📊</span>
            <span>View Reports</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardHome;
