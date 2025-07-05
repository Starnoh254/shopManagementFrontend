import React, { useState, useEffect } from "react";
import type { Customer } from "../../services/customerService";
import type { Debt } from "../../services/debtService";
import type { Payment } from "../../services/paymentService";
import { debtService } from "../../services/debtService";
import { paymentService } from "../../services/paymentService";
import Modal from "../ui/Modal";
import LoadingSpinner from "../ui/LoadingSpinner";
import Button from "../ui/Button";

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEdit?: (customer: Customer) => void;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onClose,
  customer,
  onEdit,
}) => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "debts" | "payments">("overview");

  const fetchCustomerData = async () => {
    if (!customer) {
      return;
    }

    setIsLoading(true);
    try {
      const [customerDebts, customerPayments] = await Promise.all([
        debtService.getByCustomer(customer.id),
        paymentService.getCustomerPayments(customer.id),
      ]);
      setDebts(customerDebts);
      setPayments(customerPayments);
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, customer]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!customer) {
    return null;
  }

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const activeDebts = debts.filter(debt => !debt.isPaid && (debt.remainingAmount || debt.amount) > 0);
  const paidDebts = debts.filter(debt => debt.isPaid || (debt.remainingAmount || debt.amount) <= 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {customer.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{customer.phone}</p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                onClick={() => onEdit(customer)}
                variant="secondary"
                size="sm"
              >
                Edit
              </Button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("debts")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "debts"
                ? "border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Debts ({debts.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "payments"
                ? "border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Payments ({payments.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6 w-full">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Status
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <div
                            className="bg-green-500"
                          />
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium bg-green-400 text-green-800 dark:bg-green-900 dark:text-green-200"
                          >
                            Active
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Member Since
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(customer.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {customer.balance && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Balance Status
                            </label>
                            <div className="mt-1">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
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
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Net Balance
                            </label>
                            <p
                              className={`font-semibold ${
                                customer.balance.netBalance > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : customer.balance.netBalance < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {customer.balance.netBalance > 0 ? "+" : ""}
                              {formatCurrency(Math.abs(customer.balance.netBalance))}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 w-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Financial Summary
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                      <div className="text-center min-w-0">
                        <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                          {debts.length}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                          Total Debts
                        </p>
                      </div>
                      <div className="text-center min-w-0">
                        <p className="text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400">
                          {activeDebts.length}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                          Active Debts
                        </p>
                      </div>
                      <div className="text-center min-w-0">
                        <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                          {payments.length}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                          Total Payments
                        </p>
                      </div>
                      <div className="text-center min-w-0">
                        <p className="text-lg lg:text-sm
                         font-bold text-green-600 dark:text-green-400 break-words">
                          {formatCurrency(totalPayments)}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                          Total Paid
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Debts Tab */}
              {activeTab === "debts" && (
                <div className="space-y-4">
                  {debts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        No debts found for this customer
                      </p>
                    </div>
                  ) : (
                    <>
                      {activeDebts.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
                            Outstanding Debts ({activeDebts.length})
                          </h3>
                          <div className="space-y-2">
                            {activeDebts.map((debt) => (
                              <div
                                key={debt.id}
                                className="p-3 border border-red-200 dark:border-red-800 rounded-lg"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {debt.description}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Due: {formatDate(debt.dueDate)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-red-600 dark:text-red-400">
                                      {formatCurrency(debt.remainingAmount || debt.amount)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      of {formatCurrency(debt.amount)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {paidDebts.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
                            Paid Debts ({paidDebts.length})
                          </h3>
                          <div className="space-y-2">
                            {paidDebts.map((debt) => (
                              <div
                                key={debt.id}
                                className="p-3 border border-green-200 dark:border-green-800 rounded-lg"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {debt.description}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Due: {formatDate(debt.dueDate)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-green-600 dark:text-green-400">
                                      {formatCurrency(debt.amount)} ✓
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Paid in full
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === "payments" && (
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        No payments found for this customer
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {payment.description || "No description"}
                              </p>
                              <div className="flex items-center gap-4 mt-1">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    payment.method === "CASH"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  }`}
                                >
                                  {payment.method ? payment.method.replace("_", " ") : "N/A"}
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatDateTime(payment.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(payment.amount || 0)}
                              </p>
                              {(payment.appliedToDebt !== undefined && payment.appliedToDebt > 0) || 
                               (payment.creditAmount !== undefined && payment.creditAmount > 0) ? (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {payment.appliedToDebt !== undefined && payment.appliedToDebt > 0 && (
                                    <p>Applied: {formatCurrency(payment.appliedToDebt)}</p>
                                  )}
                                  {payment.creditAmount !== undefined && payment.creditAmount > 0 && (
                                    <p>Credit: {formatCurrency(payment.creditAmount)}</p>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CustomerDetailsModal;
