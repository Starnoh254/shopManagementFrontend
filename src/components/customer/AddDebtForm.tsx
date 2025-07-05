import React, { useState, useEffect } from "react";
import { debtService } from "../../services/debtService";
import { customerService, type Customer } from "../../services/customerService";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

interface AddDebtProps {
  customerId: number;
  onSuccess: () => void;
}

const AddDebtForm: React.FC<AddDebtProps> = ({ customerId, onSuccess }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    dueDate: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Set default due date to 7 days from now
  useEffect(() => {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    setFormData((prev) => ({
      ...prev,
      dueDate: defaultDueDate.toISOString().split("T")[0],
    }));
  }, []);

  // Fetch customer data to show credit balance
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customerData = await customerService.getById(customerId);
        setCustomer(customerData);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      await debtService.create({
        customerId,
        amount: Number(formData.amount),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
      });

      // Show success message with credit application info
      if (
        customer?.balance?.creditBalance &&
        customer.balance.creditBalance > 0
      ) {
        const creditApplied = Math.min(
          Number(formData.amount),
          customer.balance.creditBalance
        );
        const finalAmount = Math.max(
          0,
          Number(formData.amount) - customer.balance.creditBalance
        );

        if (creditApplied > 0) {
          alert(
            `Debt created successfully! KES ${creditApplied.toFixed(
              2
            )} credit was automatically applied. ` +
              `Final amount owed: KES ${finalAmount.toFixed(2)}`
          );
        } else {
          alert("Debt added successfully!");
        }
      } else {
        alert("Debt added successfully!");
      }

      // Reset form
      setFormData({
        amount: "",
        description: "",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
      setErrors({});

      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Failed to add debt";
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  return (
    <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Add Debt for {customer?.name || "Customer"}
      </h3>

      {/* Credit Balance Notice */}
      {customer?.balance?.creditBalance &&
        customer.balance.creditBalance > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-700 dark:text-green-300">
              💳 Available Credit:{" "}
              {formatCurrency(customer.balance.creditBalance)}
            </p>
          </div>
        )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="number"
          name="amount"
          label="Amount (KES)"
          value={formData.amount}
          onChange={handleInputChange}
          min="0"
          step="0.01"
          placeholder="0.00"
          disabled={isLoading}
          error={errors.amount}
          required
        />

        {/* Credit Application Preview */}
        {customer?.balance?.creditBalance &&
          customer.balance.creditBalance > 0 &&
          formData.amount &&
          Number(formData.amount) > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                💡 Auto Credit Application Preview
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">
                    Debt Amount:
                  </span>
                  <span className="font-medium">
                    KES {Number(formData.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">
                    Credit Applied:
                  </span>
                  <span className="font-medium text-green-600">
                    KES{" "}
                    {Math.min(
                      Number(formData.amount),
                      customer.balance.creditBalance
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-1">
                  <span className="text-blue-900 dark:text-blue-200 font-medium">
                    Final Amount Owed:
                  </span>
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    KES{" "}
                    {Math.max(
                      0,
                      Number(formData.amount) - customer.balance.creditBalance
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

        <Textarea
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="What is this debt for?"
          disabled={isLoading}
          error={errors.description}
          required
        />

        <Input
          type="date"
          name="dueDate"
          label="Due Date"
          value={formData.dueDate}
          onChange={handleInputChange}
          disabled={isLoading}
          error={errors.dueDate}
          required
        />

        {errors.submit && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.submit}
            </p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full"
        >
          Add Debt
        </Button>
      </form>
    </div>
  );
};

export default AddDebtForm;
