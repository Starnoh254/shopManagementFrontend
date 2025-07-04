import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { debtService } from "../../services/debtService";
import type { Debt } from "../../services/debtService";
import CreateDebtModal from "../debts/CreateDebtModal";
import RecordPaymentModal from "../payments/RecordPaymentModal";
import Button from "../ui/Button";
import LoadingState from "../ui/LoadingState";
import EmptyState from "../ui/EmptyState";
import Card from "../ui/Card";

interface CustomerWithDebts {
  id: number;
  name: string;
  phone: string;
  totalDebt: number;
  unpaidDebts: Debt[];
}

const AllDebtsList: React.FC = () => {
  const [customersWithDebts, setCustomersWithDebts] = useState<
    CustomerWithDebts[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDebtModal, setShowCreateDebtModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchCustomersWithDebts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await debtService.getCustomersWithUnpaidDebts();
      setCustomersWithDebts(data);
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
          : "Failed to fetch customers with debts";
      setError(message);
      console.error("Error fetching customers with debts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersWithDebts();
  }, []);

  // Handle ?action=create parameter
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "create") {
      setShowCreateDebtModal(true);
      // Remove the action parameter from URL
      searchParams.delete("action");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleDebtCreated = () => {
    fetchCustomersWithDebts(); // Refresh the list
    setShowCreateDebtModal(false);
  };

  const handleRecordPayment = (debt: Debt) => {
    setSelectedDebt(debt);
  };

  const handlePaymentSuccess = () => {
    setSelectedDebt(null);
    fetchCustomersWithDebts(); // Refresh the list
  };

  const handleDeleteDebt = async (debtId: number) => {
    if (confirm("Are you sure you want to delete this debt?")) {
      try {
        await debtService.delete(debtId);
        fetchCustomersWithDebts(); // Refresh the list
      } catch (err) {
        console.error("Error deleting debt:", err);
        alert("Failed to delete debt. Please try again.");
      }
    }
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

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Failed to load debts"
        description={error}
        action={<Button onClick={fetchCustomersWithDebts}>Try Again</Button>}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customer Debts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage unpaid debts and track customer balances
          </p>
        </div>
        <Button onClick={() => setShowCreateDebtModal(true)} variant="primary">
          Create New Debt
        </Button>
      </div>

      {customersWithDebts.length === 0 ? (
        <EmptyState
          icon="💰"
          title="No unpaid debts found"
          description="All customers are up to date with their payments!"
          action={
            <Button
              onClick={() => setShowCreateDebtModal(true)}
              variant="primary"
            >
              Create New Debt
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {customersWithDebts.map((customer) => (
            <Card key={customer.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {customer.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {customer.phone}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Outstanding
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(customer.totalDebt || 0)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Unpaid Debts ({customer.unpaidDebts.length})
                </h4>
                {customer.unpaidDebts.map((debt) => (
                  <div
                    key={debt.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {debt.description}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {formatDate(debt.dueDate)} • Amount:{" "}
                        {formatCurrency(debt.amount)}
                      </p>
                      {debt.remainingAmount &&
                        debt.remainingAmount !== debt.amount && (
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            Remaining: {formatCurrency(debt.remainingAmount)}
                          </p>
                        )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleRecordPayment(debt)}
                      >
                        Record Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteDebt(debt.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Debt Modal */}
      <CreateDebtModal
        isOpen={showCreateDebtModal}
        onClose={() => setShowCreateDebtModal(false)}
        onSuccess={handleDebtCreated}
      />

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

export default AllDebtsList;
