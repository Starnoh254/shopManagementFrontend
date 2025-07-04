import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { debtService } from "../../services/debtService";
import type { Debt } from "../../services/debtService";
import Card from "../ui/Card";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import LoadingState from "../ui/LoadingState";
import Modal from "../ui/Modal";
import RecordPaymentModal from "./RecordPaymentModal";

interface CustomerWithDebts {
  id: number;
  name: string;
  phone: string;
  totalDebt: number;
  unpaidDebts: Debt[];
}

const PaymentsList: React.FC = () => {
  const [customersWithDebts, setCustomersWithDebts] = useState<
    CustomerWithDebts[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for query parameter to open payment modal
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "create") {
      setShowCustomerSelection(true);
      // Remove the action parameter from URL
      searchParams.delete("action");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const fetchCustomersWithDebts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await debtService.getCustomersWithUnpaidDebts();
      setCustomersWithDebts(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch customers with debts";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersWithDebts();
  }, []);

  const handleRecordPayment = () => {
    setShowCustomerSelection(true);
  };

  const handleSelectDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowCustomerSelection(false);
  };

  const handlePaymentSuccess = () => {
    setSelectedDebt(null);
    fetchCustomersWithDebts(); // Refresh the list
  };

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
        loadingText="Loading customers with debts..."
        children={null}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Record payments for customer debts
          </p>
        </div>
        <Button variant="primary" onClick={handleRecordPayment}>
          Record Payment
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {customersWithDebts.length === 0 ? (
        <EmptyState
          icon="💳"
          title="No customers with debts found"
          description="There are no customers with outstanding debts to record payments for."
          action={
            <Button variant="primary" onClick={handleRecordPayment}>
              Record Payment
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Customers with Outstanding Debts
          </h2>
          <div className="grid gap-4">
            {customersWithDebts.map((customer) => (
              <Card key={customer.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {customer.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Outstanding
                    </p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(customer.totalDebt)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unpaid Debts ({customer.unpaidDebts.length})
                  </h4>
                  {customer.unpaidDebts.map((debt) => (
                    <div
                      key={debt.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {debt.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Due: {formatDate(debt.dueDate)} • Amount:{" "}
                          {formatCurrency(debt.amount)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleSelectDebt(debt)}
                      >
                        Record Payment
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Customer Selection Modal */}
      <Modal
        isOpen={showCustomerSelection}
        onClose={() => setShowCustomerSelection(false)}
        size="lg"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Select Customer & Debt
            </h2>
            <button
              onClick={() => setShowCustomerSelection(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>

          {customersWithDebts.length === 0 ? (
            <EmptyState
              icon="💳"
              title="No customers with debts"
              description="All customers are up to date with their payments!"
            />
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {customersWithDebts.map((customer) => (
                <div
                  key={customer.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {customer.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {customer.phone}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-red-600">
                      Total: {formatCurrency(customer.totalDebt)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {customer.unpaidDebts.map((debt) => (
                      <div
                        key={debt.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSelectDebt(debt)}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {debt.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {formatDate(debt.dueDate)}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(debt.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Record Payment Modal */}
      {selectedDebt && (
        <RecordPaymentModal
          isOpen={!!selectedDebt}
          onClose={() => setSelectedDebt(null)}
          onSuccess={handlePaymentSuccess}
          debt={selectedDebt}
        />
      )}
    </div>
  );
};

export default PaymentsList;
