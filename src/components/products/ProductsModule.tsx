import React, { useState } from "react";
import ProductsList from "./ProductsList";
import CreateProductModal from "./CreateProductModal";
import ProductDetails from "./ProductDetails";
import type { Product } from "../../types/sales";

type ViewType = "list" | "details";

const ProductsModule: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setSelectedProduct(null);
    setCurrentView("list");
  };

  const handleProductCreated = () => {
    setIsCreateModalOpen(false);
    // Refresh data if needed
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setSelectedProduct(updatedProduct);
    // Refresh list data if needed
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Products Management
          </h1>

          {/* Navigation breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <button
              onClick={handleBackToList}
              className={`hover:text-gray-700 ${
                currentView === "list" ? "text-blue-600 font-medium" : ""
              }`}
            >
              Products List
            </button>
            {currentView === "details" && selectedProduct && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium">
                  {selectedProduct.name}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          {currentView !== "list" && (
            <button
              onClick={handleBackToList}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to List
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="min-h-[600px]">
        {currentView === "list" && (
          <ProductsList onProductSelect={handleProductSelect} />
        )}

        {currentView === "details" && selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            onBack={handleBackToList}
            onProductUpdate={handleProductUpdated}
          />
        )}
      </div>

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
};

export default ProductsModule;
