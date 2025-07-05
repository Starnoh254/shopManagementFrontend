import React, { useState, useEffect } from "react";
import type { Debt } from "../../services/debtService";
import { debtService } from "../../services/debtService";
import type { Customer } from "../../services/customerService";
import { customerService } from "../../services/customerService";
import axiosInstance from "../../api/axios";
import { getAuthHeaders } from "../../utils/getAuthHeaders";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Modal from "../ui/Modal";

interface CreateDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (debt: Debt) => void;
  preselectedCustomerId?: number;
}

const CreateDebtModal: React.FC<CreateDebtModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedCustomerId,
}) => {
  const [formData, setFormData] = useState({
    customerId: preselectedCustomerId || 0,
    amount: "",
    description: "",
    dueDate: "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Set default due date to 7 days from now
  useEffect(() => {
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7);
    setFormData((prev) => ({
      ...prev,
      dueDate: defaultDueDate.toISOString().split("T")[0],
    }));
  }, []);

  // Fetch customers when modal opens
  useEffect(() => {
    if (isOpen && !preselectedCustomerId) {
      fetchCustomers();
    } else if (isOpen && preselectedCustomerId) {
      // If we have a preselected customer, fetch all customers to get the one with balance info
      fetchCustomers();
    }
  }, [isOpen, preselectedCustomerId]);

  // Set selected customer when customers are loaded and we have a preselected ID
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0) {
      const customer = customers.find((c) => c.id === preselectedCustomerId);
      setSelectedCustomer(customer || null);
    }
  }, [preselectedCustomerId, customers]);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      // Try the new customerService first
      let data: Customer[];
      try {
        data = await customerService.getAll();
      } catch {
        console.log("New customer service failed, trying old endpoint...");
        // Fallback to the old endpoint that works in AllDebtsList
        const response = await axiosInstance.get("/customer/getAllCustomers", {
          headers: getAuthHeaders(),
        });
        data = response.data.customers || [];
      }

      // Filter for active customers and ensure they have the right structure
      const activeCustomers = data
        .filter((customer) => customer.status === "ACTIVE" || !customer.status)
        .map((customer) => ({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          status: (customer.status || "ACTIVE") as "ACTIVE" | "INACTIVE",
          totalDebt: customer.totalDebt || 0,
          createdAt: customer.createdAt || new Date().toISOString(),
        }));

      setCustomers(activeCustomers);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]); // Set empty array on error
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.customerId) {
      newErrors.customerId = "Please select a customer";
    }

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Track selected customer for credit balance display
    if (name === "customerId") {
      const customer = customers.find((c) => c.id === Number(value));
      setSelectedCustomer(customer || null);
    }

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
      const debt = await debtService.create({
        customerId: Number(formData.customerId),
        amount: Number(formData.amount),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
      });

      // Show success message with credit application info
      if (
        selectedCustomer?.balance?.creditBalance &&
        selectedCustomer.balance.creditBalance > 0
      ) {
        const creditApplied = Math.min(
          Number(formData.amount),
          selectedCustomer.balance.creditBalance
        );
        const finalAmount = Math.max(
          0,
          Number(formData.amount) - selectedCustomer.balance.creditBalance
        );

        if (creditApplied > 0) {
          alert(
            `Debt created successfully! KES ${creditApplied.toFixed(
              2
            )} credit was automatically applied. ` +
              `Final amount owed: KES ${finalAmount.toFixed(2)}`
          );
        }
      }

      // Reset form
      setFormData({
        customerId: preselectedCustomerId || 0,
        amount: "",
        description: "",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
      setSelectedCustomer(null);
      setErrors({});

      onSuccess(debt);
      onClose();
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
          : "Failed to create debt";
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        customerId: preselectedCustomerId || 0,
        amount: "",
        description: "",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
      setSelectedCustomer(null);
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add New Debt
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection */}
          {!preselectedCustomerId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors ${
                  errors.customerId
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-primary-light dark:focus:border-primary-dark"
                }`}
                disabled={isLoading || isLoadingCustomers}
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.phone})
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.customerId}
                </p>
              )}
              {isLoadingCustomers && (
                <p className="mt-1 text-sm text-gray-500">
                  Loading customers...
                </p>
              )}
            </div>
          )}

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
          {selectedCustomer &&
            selectedCustomer.balance?.creditBalance &&
            selectedCustomer.balance.creditBalance > 0 &&
            formData.amount &&
            Number(formData.amount) > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  💳 Auto Credit Application Preview
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
                      Available Credit:
                    </span>
                    <span className="font-medium text-green-600">
                      KES {selectedCustomer.balance.creditBalance.toFixed(2)}
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
                        selectedCustomer.balance.creditBalance
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
                        Number(formData.amount) -
                          selectedCustomer.balance.creditBalance
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  💡 Credit will be automatically applied when this debt is
                  created
                </p>
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
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              Create Debt
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateDebtModal;
