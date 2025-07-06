import React, { useState } from "react";
import SalesOverview from "./SalesOverview";
import SalesList from "./SalesList";
import CreateSaleModal from "./CreateSaleModal";
import SaleDetails from "./SaleDetails";
import type { Sale } from "../../types/sales";

type ViewType = "overview" | "list" | "details";

const SalesModule: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("overview");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSaleSelect = (sale: Sale) => {
    setSelectedSale(sale);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setSelectedSale(null);
    setCurrentView("list");
  };

  const handleBackToOverview = () => {
    setSelectedSale(null);
    setCurrentView("overview");
  };

  const handleSaleCreated = () => {
    setIsCreateModalOpen(false);
    // Refresh data if needed
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>

          {/* Navigation breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <button
              onClick={handleBackToOverview}
              className={`hover:text-gray-700 ${
                currentView === "overview" ? "text-blue-600 font-medium" : ""
              }`}
            >
              Overview
            </button>
            {currentView !== "overview" && (
              <>
                <span>/</span>
                <button
                  onClick={handleBackToList}
                  className={`hover:text-gray-700 ${
                    currentView === "list" ? "text-blue-600 font-medium" : ""
                  }`}
                >
                  Sales List
                </button>
              </>
            )}
            {currentView === "details" && selectedSale && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium">
                  Sale #{selectedSale.id}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          {currentView !== "overview" && (
            <button
              onClick={handleBackToOverview}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Overview
            </button>
          )}

          <button
            onClick={() => setCurrentView("list")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === "list"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-gray-600 bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            View All Sales
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Sale
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="min-h-[600px]">
        {currentView === "overview" && (
          <SalesOverview onViewAllSales={() => setCurrentView("list")} />
        )}

        {currentView === "list" && (
          <SalesList onSaleSelect={handleSaleSelect} />
        )}

        {currentView === "details" && selectedSale && (
          <SaleDetails
            sale={selectedSale}
            onBack={handleBackToList}
            onSaleUpdate={(updatedSale: Sale) => setSelectedSale(updatedSale)}
          />
        )}
      </div>

      {/* Create Sale Modal */}
      <CreateSaleModal
      
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaleCreated={handleSaleCreated}
      />
    </div>
  );
};

export default SalesModule;
