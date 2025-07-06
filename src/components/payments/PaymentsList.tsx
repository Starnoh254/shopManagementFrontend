import React, { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";

interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  customerName: string;
  description?: string;
}

const PaymentsList: React.FC = () => {
  const [payments] = useState<Payment[]>([]);
  const [isLoading] = useState(false);

  const handleRecordPayment = () => {
    console.log("Record payment clicked");
    // TODO: Implement payment recording
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading payments...
          </p>
        </div>
      </div>
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
            Track and manage payment records
          </p>
        </div>
        <Button variant="primary" onClick={handleRecordPayment}>
          Record Payment
        </Button>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          title="No payments recorded yet"
          description="Start by recording a payment to track your transactions."
          action={
            <Button variant="primary" onClick={handleRecordPayment}>
              Record Payment
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {payment.customerName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {payment.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    KES {payment.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentsList;
