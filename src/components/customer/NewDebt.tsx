import React, { useState } from "react";
import axiosInstance from "../../api/axios";
import { getAuthHeaders } from "../../utils/getAuthHeaders";
import axios from "axios";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";

interface NewDebtProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const NewDebt: React.FC<NewDebtProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
    description: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
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
      await axiosInstance.post(
        "/customer/add",
        {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          amount: Number(formData.amount),
          status: "active",
          description: formData.description.trim() || undefined,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      // Reset form
      setFormData({ name: "", phone: "", amount: "", description: "" });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Failed to add debt";
        setErrors({ submit: message });
      } else {
        setErrors({ submit: "Failed to add debt" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Add New Debt
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isLoading}
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <Input
          name="name"
          label="Customer Name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter customer name"
          disabled={isLoading}
          error={errors.name}
          required
        />

        {/* Phone Field */}
        <Input
          type="tel"
          name="phone"
          label="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="+254712345678"
          disabled={isLoading}
          error={errors.phone}
          required
        />

        {/* Amount Field */}
        <Input
          type="number"
          name="amount"
          label="Amount (Ksh)"
          value={formData.amount}
          onChange={handleInputChange}
          min="0"
          step="0.01"
          placeholder="0.00"
          disabled={isLoading}
          error={errors.amount}
          required
        />

        {/* Description Field */}
        <Textarea
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="What was this debt for?"
          disabled={isLoading}
          helperText="Optional: Add a description for this debt"
        />

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className={onCancel ? "flex-1" : "w-full"}
          >
            Add Debt
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewDebt;
