import React, { useState, useEffect } from "react";
import type { Debt } from "../../services/debtService";
import { debtService } from "../../services/debtService";
import DebtCard from "./DebtCard";
import CreateDebtModal from "./CreateDebtModal";
import RecordPaymentModal from "../payments/RecordPaymentModal";
import LoadingState from "../ui/LoadingState";
import EmptyState from "../ui/EmptyState";
import Button from "../ui/Button";
import Input from "../ui/Input";

const DebtsModule: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [filteredDebts, setFilteredDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "PAID" | "OVERDUE"
  >("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const fetchDebts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await debtService.getAll();
      setDebts(data);
      console.log(`Here are the debts : ${JSON.stringify(data)}`)
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
          : "Failed to fetch debts";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  // Filter debts based on search term and status
  useEffect(() => {
    let filtered = debts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (debt) =>
          debt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (debt.customerName &&
            debt.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      if (statusFilter === "OVERDUE") {
        filtered = filtered.filter(
          (debt) =>
            new Date(debt.dueDate) < new Date() && debt.status === "PENDING"
        );
      } else {
        filtered = filtered.filter((debt) => debt.status === statusFilter);
      }
    }

    setFilteredDebts(filtered);
  }, [debts, searchTerm, statusFilter]);

  const handleDebtCreated = (newDebt: Debt) => {
    setDebts((prev) => [newDebt, ...prev]);
    setShowCreateModal(false);
  };

  const handleRecordPayment = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowPaymentModal(true);
  };

  const handlePaymentRecorded = () => {
    setShowPaymentModal(false);
    setSelectedDebt(null);
    fetchDebts(); // Refresh to get updated debt status
  };

  const handleEditDebt = (debt: Debt) => {
    // TODO: Implement edit functionality
    console.log("Edit debt:", debt);
  };

  const handleDeleteDebt = async (debt: Debt) => {
    if (
      !confirm(
        `Are you sure you want to delete the debt "${debt.description}"?`
      )
    ) {
      return;
    }

    try {
      await debtService.delete(debt.id);
      setDebts((prev) => prev.filter((d) => d.id !== debt.id));
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
          : "Failed to delete debt";
      setError(message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const totalDebt = debts.reduce(
    (sum, debt) => sum + (debt.remainingAmount || debt.amount),
    0
  );
  const paidDebts = debts.filter((debt) => debt.status === "PAID");
  const pendingDebts = debts.filter((debt) => debt.status === "PENDING");
  const overdueDebts = debts.filter(
    (debt) => new Date(debt.dueDate) < new Date() && debt.status === "PENDING"
  );

  if (isLoading) {
    return (
      <LoadingState
        isLoading={true}
        loadingText="Loading debts..."
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
            Debt Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage customer debts and payments
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Record New Debt
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Outstanding
          </h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalDebt)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pending Debts
          </h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {pendingDebts.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Overdue Debts
          </h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overdueDebts.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Paid Debts
          </h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {paidDebts.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by description or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors"
          >
            <option value="ALL">All Debts</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Debts List */}
      {filteredDebts.length === 0 ? (
        <EmptyState
          title="No debts found"
          description={
            searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your search or filter criteria"
              : "Start by recording your first debt"
          }
          action={
            !searchTerm && statusFilter === "ALL" ? (
              <Button onClick={() => setShowCreateModal(true)}>
                Record First Debt
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredDebts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onPayment={handleRecordPayment}
              onEdit={handleEditDebt}
              onDelete={() => handleDeleteDebt(debt)}
              showCustomer={true}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateDebtModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleDebtCreated}
      />

      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentRecorded}
        debt={selectedDebt}
      />
    </div>
  );
};

export default DebtsModule;
