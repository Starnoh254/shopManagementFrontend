import React, { useState, useEffect } from "react";
import type {
  Customer,
  UpdateCustomerRequest,
} from "../../services/customerService";
import { customerService } from "../../services/customerService";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
  customer: Customer | null;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer,
}) => {
  const [formData, setFormData] = useState<UpdateCustomerRequest>({
    name: "",
    phone: "",
    status: "ACTIVE",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        status: customer.status,
      });
    }
  }, [customer]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Customer name is required";
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    if (!customer || !validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await customerService.update(customer.id, {
        ...formData,
        phone: formData.phone?.trim(),
        name: formData.name?.trim(),
      });

      // Since update returns void, we need to create the updated customer object
      const updatedCustomer: Customer = {
        ...customer,
        ...formData,
        phone: formData.phone?.trim() || customer.phone,
        name: formData.name?.trim() || customer.name,
      };

      onSuccess(updatedCustomer);
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
          : "Failed to update customer";

      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  if (!customer) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Customer
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
          <Input
            name="name"
            label="Customer Name"
            value={formData.name || ""}
            onChange={handleInputChange}
            placeholder="Enter customer name"
            disabled={isLoading}
            error={errors.name}
            required
          />

          <Input
            type="tel"
            name="phone"
            label="Phone Number"
            value={formData.phone || ""}
            onChange={handleInputChange}
            placeholder="+254712345678"
            disabled={isLoading}
            error={errors.phone}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status || "ACTIVE"}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors"
              disabled={isLoading}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

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
              Update Customer
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditCustomerModal;
