import React from "react";
import type { Product } from "../../types/sales";

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onProductUpdate: (product: Product) => void;
}

// TODO: Implement full ProductDetails
const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack }) => {
  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Product Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <p className="font-medium">{product.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">SKU</p>
            <p className="font-medium">{product.sku || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Selling Price</p>
            <p className="font-medium">
              {formatCurrency(product.sellingPrice)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cost Price</p>
            <p className="font-medium">{formatCurrency(product.costPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="font-medium">
              {product.currentStock} {product.unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Profit Margin</p>
            <p className="font-medium text-green-600">
              {product.profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        {product.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Description</p>
            <p className="font-medium">{product.description}</p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-gray-600">
            Full product editing and inventory management coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
