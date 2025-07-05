import React, { useState } from "react";
import type { Customer } from "../../services/customerService";
import { paymentService } from "../../services/paymentService";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface CustomerCardProps {
  customer: Customer;
  onView?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onCreditApplied?: () => void; // Callback when credit is applied
  showActions?: boolean;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onView,
  onEdit,
  onDelete,
  onCreditApplied,
  showActions = true,
}) => {
  const [isApplyingCredit, setIsApplyingCredit] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const handleApplyCredit = async () => {
    if (
      !customer.balance?.creditBalance ||
      customer.balance.creditBalance <= 0
    ) {
      return;
    }

    setIsApplyingCredit(true);
    try {
      const response = await paymentService.applyCredit(customer.id);

      if (response.success) {
        alert(
          `Credit applied successfully! ${formatCurrency(
            response.summary.creditApplied
          )} was used to pay debts.`
        );
        onCreditApplied?.();
      }
    } catch (error) {
      console.error("Error applying credit:", error);
      alert("Failed to apply credit. Please try again.");
    } finally {
      setIsApplyingCredit(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {customer.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {customer.phone}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            customer.status === "ACTIVE"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {customer.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {/* Balance Information */}
        {customer.balance ? (
          // Use detailed balance if available
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Balance Status:
              </span>
              <span
                className={`font-medium px-2 py-1 rounded text-xs ${
                  customer.balance.status === "CREDIT"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : customer.balance.status === "DEBT"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {customer.balance.status}
              </span>
            </div>

            {customer.balance.totalDebt > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Debt:
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(customer.balance.totalDebt)}
                </span>
              </div>
            )}

            {customer.balance.creditBalance >= 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Credit Balance:
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {customer.balance.creditBalance > 0 ? "+" : ""}
                  {formatCurrency(customer.balance.creditBalance)}
                </span>
              </div>
            )}

            <div className="flex justify-between font-medium border-t pt-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Net Balance:
              </span>
              <span
                className={`${
                  customer.balance.netBalance > 0
                    ? "text-green-600 dark:text-green-400"
                    : customer.balance.netBalance < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {customer.balance.netBalance > 0 ? "+" : ""}
                {formatCurrency(Math.abs(customer.balance.netBalance))}
              </span>
            </div>
          </div>
        ) : (
          // Fallback to simple debt display
          <>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Debt:
              </span>
              <span
                className={`font-medium ${
                  (customer.totalDebt || 0) > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {formatCurrency(customer.totalDebt || 0)}
              </span>
            </div>

            {customer.creditBalance !== undefined &&
              customer.creditBalance >= 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Credit Balance:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {customer.creditBalance > 0 ? "+" : ""}
                    {formatCurrency(customer.creditBalance)}
                  </span>
                </div>
              )}
          </>
        )}

        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Member Since:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(customer.createdAt)}
          </span>
        </div>

        {customer.lastPaymentDate && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Last Payment:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(customer.lastPaymentDate)}
            </span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Apply Credit Button */}
          {customer.balance?.creditBalance &&
            customer.balance.creditBalance > 0 &&
            customer.balance.totalDebt > 0 && (
              <Button
                onClick={handleApplyCredit}
                disabled={isApplyingCredit}
                variant="primary"
                size="sm"
                className="w-full"
              >
                {isApplyingCredit
                  ? "Applying..."
                  : `Apply Credit (${formatCurrency(
                      customer.balance.creditBalance
                    )})`}
              </Button>
            )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {onView && (
              <button
                onClick={() => onView(customer)}
                className="flex-1 px-3 py-2 text-sm font-medium text-primary-light dark:text-primary-dark hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark rounded-md transition-colors"
              >
                View Details
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(customer)}
                className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(customer)}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CustomerCard;
