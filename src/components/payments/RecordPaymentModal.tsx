import React, { useState } from "react";
import type { Debt } from "../../services/debtService";
import type { Payment } from "../../services/paymentService";
import { paymentService } from "../../services/paymentService";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Modal from "../ui/Modal";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
  debt: Debt | null;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  debt,
}) => {
  const [formData, setFormData] = useState({
    customerId: "",
    debtId: "",
    amount: "",
    method: "CASH" as "CASH" | "MOBILE_MONEY",
    description: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // For standalone payments (no debt), customerId is required
    if (!debt && !formData.customerId) {
      newErrors.customerId = "Customer is required";
    }

    if (!formData.amount) {
      newErrors.amount = "Payment amount is required";
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "Payment amount must be greater than 0";
    }
    // Note: Removed max payment validation to allow overpayments (creating credit balance)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let payment: Payment;

      if (debt) {
        // Payment for a specific debt
        payment = await paymentService.create({
          customerId: debt.customerId,
          debtId: debt.id,
          amount: Number(formData.amount),
          method: formData.method as "CASH" | "MOBILE_MONEY",
          description:
            (formData.description || "").trim() ||
            `Payment for ${debt.description}`,
        });
      } else {
        // Standalone payment (credit, overpayment, etc.)
        payment = await paymentService.recordStandalone({
          customerId: Number(formData.customerId),
          amount: Number(formData.amount),
          method: formData.method as "CASH" | "MOBILE_MONEY",
          description: (formData.description || "").trim() || "General payment",
        });
      }

      // Reset form
      setFormData({
        customerId: "",
        debtId: "",
        amount: "",
        method: "CASH",
        description: "",
      });
      setErrors({});

      onSuccess(payment);
      onClose();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || "Failed to record payment";
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        customerId: "",
        debtId: "",
        amount: "",
        method: "CASH",
        description: "",
      });
      setErrors({});
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Record Payment
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {/* Debt Information or Customer Selection */}
        {debt ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Debt Details
            </h3>
            <div className="space-y-1 text-sm">
              {debt.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Customer:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {debt.customerName}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Description:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {debt.description}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Amount:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(debt.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Remaining:
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(debt.remainingAmount || debt.amount)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Standalone Payment
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recording a payment not tied to a specific debt (e.g., credit,
              overpayment)
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection for Standalone Payments */}
          {!debt && (
            <Input
              type="number"
              name="customerId"
              label="Customer ID"
              value={formData.customerId}
              onChange={handleInputChange}
              min="1"
              placeholder="Enter customer ID"
              disabled={isLoading}
              error={errors.customerId}
              required
              helperText="Enter the ID of the customer for this payment"
            />
          )}

          <Input
            type="number"
            name="amount"
            label="Payment Amount (KES)"
            value={formData.amount}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            placeholder="0.00"
            disabled={isLoading}
            error={errors.amount}
            helperText={
              debt
                ? `Debt amount: ${formatCurrency(
                    debt.remainingAmount || debt.amount
                  )} (you can pay more to create credit balance)`
                : "Enter the payment amount"
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors"
              disabled={isLoading}
            >
              <option value="CASH">Cash</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
            </select>
          </div>

          <Textarea
            name="description"
            label="Payment Description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Optional: Add payment details..."
            disabled={isLoading}
            helperText="This will help identify the payment later"
          />

          {/* Quick Amount Buttons */}
          {debt && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Quick Amount
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: (debt.remainingAmount || debt.amount).toString(),
                    }))
                  }
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  disabled={isLoading}
                >
                  Exact Amount (
                  {formatCurrency(debt.remainingAmount || debt.amount)})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      amount: (
                        (debt.remainingAmount || debt.amount) / 2
                      ).toString(),
                    }))
                  }
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  disabled={isLoading}
                >
                  Half (
                  {formatCurrency((debt.remainingAmount || debt.amount) / 2)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const roundAmount =
                      Math.ceil((debt.remainingAmount || debt.amount) / 100) *
                      100;
                    setFormData((prev) => ({
                      ...prev,
                      amount: roundAmount.toString(),
                    }));
                  }}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  disabled={isLoading}
                >
                  Round Up (
                  {formatCurrency(
                    Math.ceil((debt.remainingAmount || debt.amount) / 100) * 100
                  )}
                  )
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Paying more than the debt amount creates credit balance
                for future purchases
              </p>
            </div>
          )}

          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              isLoading={isLoading}
              className="flex-1"
            >
              Record Payment
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RecordPaymentModal;
