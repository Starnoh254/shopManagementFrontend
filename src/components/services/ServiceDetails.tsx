import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Service } from "../../types/sales";
import { servicesService } from "../../services/servicesService";
import LoadingSpinner from "../ui/LoadingSpinner";

const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadService(parseInt(id));
    }
  }, [id]);

  const loadService = async (serviceId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await servicesService.getById(serviceId);
      setService(response);
    } catch (err) {
      setError("Failed to load service details");
      console.error("Error loading service:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !service) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Service Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || "The service you're looking for doesn't exist."}
        </p>
        <Link
          to="/dashboard/services"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {service.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Service Details</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Edit Service
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Delete
          </button>
        </div>
      </div>

      {/* Service Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Basic Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {service.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Category:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {service.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  (service.status || "active") === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {service.status || "active"}
              </span>
            </div>
            {service.description && (
              <div>
                <span className="text-gray-600 dark:text-gray-400 block mb-1">
                  Description:
                </span>
                <p className="text-gray-900 dark:text-gray-100">
                  {service.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pricing & Duration
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Price:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Ksh {service.price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Cost Estimate:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Ksh {service.costEstimate.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Profit Margin:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {service.profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Duration:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {service.duration} minutes
              </span>
            </div>
          </div>
        </div>

        {/* Service Settings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Service Settings
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Requires Booking:
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  service.requiresBooking
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {service.requiresBooking ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Requires Materials:
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  service.requiresMaterials
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {service.requiresMaterials ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {/* Materials List */}
        {service.requiresMaterials &&
          service.materials &&
          service.materials.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Required Materials
              </h2>
              <div className="space-y-2">
                {service.materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <span className="text-gray-900 dark:text-gray-100">
                      {material.productName}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Qty: {material.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Created Date */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Created on {new Date(service.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default ServiceDetails;
