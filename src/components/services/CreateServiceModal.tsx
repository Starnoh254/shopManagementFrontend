import React, { useState } from "react";
import type { CreateServiceRequest } from "../../types/sales";
import { servicesService } from "../../services/servicesService";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Button from "../ui/Button";

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated: () => void;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({
  isOpen,
  onClose,
  onServiceCreated,
}) => {
  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: "",
    description: "",
    category: "",
    price: 0,
    costEstimate: 0,
    duration: 60,
    requiresBooking: false,
    requiresMaterials: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await servicesService.create(formData);
      onServiceCreated();
      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        price: 0,
        costEstimate: 0,
        duration: 60,
        requiresBooking: false,
        requiresMaterials: false,
      });
    } catch (err) {
      setError("Failed to create service. Please try again.");
      console.error("Error creating service:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateServiceRequest,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Create New Service
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <Input
            label="Service Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter service name"
            required
          />

          <Textarea
            label="Description"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe your service"
            rows={3}
          />

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            placeholder="e.g., Repair, Consultation, Installation"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (Ksh)"
              type="number"
              value={formData.price}
              onChange={(e) =>
                handleInputChange("price", Number(e.target.value))
              }
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />

            <Input
              label="Cost Estimate (Ksh)"
              type="number"
              value={formData.costEstimate}
              onChange={(e) =>
                handleInputChange("costEstimate", Number(e.target.value))
              }
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              handleInputChange("duration", Number(e.target.value))
            }
            placeholder="60"
            min="1"
            required
          />

          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresBooking}
                onChange={(e) =>
                  handleInputChange("requiresBooking", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Requires booking appointment
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresMaterials}
                onChange={(e) =>
                  handleInputChange("requiresMaterials", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Requires materials/products
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.category}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Service"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateServiceModal;
