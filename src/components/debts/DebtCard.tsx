import React from "react";
import type { Debt } from "../../services/debtService";
import Card from "../ui/Card";

interface DebtCardProps {
  debt: Debt;
  onView?: (debt: Debt) => void;
  onEdit?: (debt: Debt) => void;
  onDelete?: (debt: Debt) => void;
  onPayment?: (debt: Debt) => void;
  showActions?: boolean;
  showCustomer?: boolean;
}

const DebtCard: React.FC<DebtCardProps> = ({
  debt,
  onView,
  onEdit,
  onDelete,
  onPayment,
  showActions = true,
  showCustomer = true,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "OVERDUE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  const isOverdue =
    new Date(debt.dueDate) < new Date() && debt.status === "PENDING";

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {showCustomer && debt.customerName && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {debt.customerName}
            </h3>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {debt.description}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            debt.status
          )}`}
        >
          {debt.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Original Amount:
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(debt.amount)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Remaining:
          </span>
          <span
            className={`font-medium ${
              (debt.remainingAmount || debt.amount) > 0
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {formatCurrency(debt.remainingAmount || debt.amount)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Due Date:
          </span>
          <span
            className={`text-sm font-medium ${
              isOverdue
                ? "text-red-600 dark:text-red-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {formatDate(debt.dueDate)}
            {isOverdue && " (Overdue)"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Created:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(debt.createdAt)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {debt.amount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Payment Progress</span>
            <span>
              {Math.round(
                ((debt.amount - (debt.remainingAmount || debt.amount)) /
                  debt.amount) *
                  100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-light dark:bg-primary-dark h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((debt.amount - (debt.remainingAmount || debt.amount)) /
                    debt.amount) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onView && (
            <button
              onClick={() => onView(debt)}
              className="flex-1 px-3 py-2 text-sm font-medium text-primary-light dark:text-primary-dark hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark rounded-md transition-colors"
            >
              View
            </button>
          )}
          {onPayment && (debt.remainingAmount || debt.amount) > 0 && (
            <button
              onClick={() => onPayment(debt)}
              className="flex-1 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
            >
              Record Payment
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(debt)}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(debt)}
              className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </Card>
  );
};

export default DebtCard;
