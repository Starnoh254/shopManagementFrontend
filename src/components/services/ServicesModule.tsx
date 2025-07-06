import React, { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";

const ServicesModule: React.FC = () => {
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check if we're at the main services route
  const isMainRoute =
    location.pathname === "/dashboard/services" ||
    location.pathname === "/dashboard/services/";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Services Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your service offerings and pricing
          </p>
        </div>

        {isMainRoute && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="mr-2">➕</span>
              Add Service
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      {isMainRoute && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <Link
              to="/dashboard/services"
              className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              All Services
            </Link>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        <Outlet context={{ showCreateModal, setShowCreateModal }} />
      </div>
    </div>
  );
};

export default ServicesModule;
