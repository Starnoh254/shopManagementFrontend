import React, { useState, useEffect } from "react";
import type { Payment } from "../../services/paymentService";
import { paymentService } from "../../services/paymentService";
import RecordPaymentModal from "./RecordPaymentModal";
import Card from "../ui/Card";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import LoadingState from "../ui/LoadingState";
import Input from "../ui/Input";

const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<
    "ALL" | "CASH" | "MOBILE_MONEY"
  >("ALL");
  const [showRecordModal, setShowRecordModal] = useState(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await paymentService.getAll();
      setPayments(data);
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
          : "Failed to fetch payments";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments based on search term and method
  useEffect(() => {
    let filtered = payments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.customerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          payment.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by method
    if (methodFilter !== "ALL") {
      filtered = filtered.filter((payment) => payment.method === methodFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, methodFilter]);

  const handlePaymentRecorded = () => {
    setShowRecordModal(false);
    fetchPayments(); // Refresh the list
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
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

  const totalAmount = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  if (isLoading) {
    return (
      <LoadingState
        isLoading={true}
        loadingText="Loading payments..."
        children={null}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage payment records
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowRecordModal(true)}>
          Record Payment
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Payments
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {filteredPayments.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Amount
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Average Payment
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(
              filteredPayments.length > 0
                ? totalAmount / filteredPayments.length
                : 0
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by customer name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={methodFilter}
            onChange={(e) =>
              setMethodFilter(e.target.value as typeof methodFilter)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors"
          >
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          title="No payments recorded yet"
          description={
            searchTerm || methodFilter !== "ALL"
              ? "Try adjusting your search or filter criteria"
              : "Start by recording a payment to track your transactions."
          }
          action={
            !searchTerm && methodFilter === "ALL" ? (
              <Button
                variant="primary"
                onClick={() => setShowRecordModal(true)}
              >
                Record First Payment
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {payment.customerName || "Unknown Customer"}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        payment.method === "CASH"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {payment.method.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {payment.description || "No description"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(payment.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {payment.method.replace("_", " ")}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onSuccess={handlePaymentRecorded}
        debt={null} // Allow recording payments without specific debt
      />
    </div>
  );
};

export default PaymentsList;
