import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import LoadingSpinner from "../ui/LoadingSpinner";
import { salesService } from "../../services/salesService";
import { productsService } from "../../services/productsService";
import { servicesService } from "../../services/servicesService";
import { customerService, type Customer } from "../../services/customerService";
import type { CreateSaleRequest, Product, Service } from "../../types/sales";

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleCreated: () => void;
}

interface SaleItem {
  type: "PRODUCT" | "SERVICE";
  productId?: number;
  serviceId?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  scheduledFor?: string;
}

const CreateSaleModal: React.FC<CreateSaleModalProps> = ({
  isOpen,
  onClose,
  onSaleCreated,
}) => {
  const [formData, setFormData] = useState<CreateSaleRequest>({
    items: [],
    saleType: "CASH",
    paymentAmount: 0,
    paymentMethod: "CASH",
    discountAmount: 0,
    taxAmount: 0,
  });

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemType, setSelectedItemType] = useState<
    "PRODUCT" | "SERVICE"
  >("PRODUCT");

  useEffect(() => {
    if (isOpen) {
      loadData();
      resetForm();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [productsData, servicesData, customersData] = await Promise.all([
        productsService.getAll(),
        servicesService.getAll(),
        customerService.getAll(),
      ]);

      setProducts(productsData.products);
      setServices(servicesData.services);
      setCustomers(customersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  };

  const resetForm = () => {
    setFormData({
      items: [],
      saleType: "CASH",
      paymentAmount: 0,
      paymentMethod: "CASH",
      discountAmount: 0,
      taxAmount: 0,
    });
    setSaleItems([]);
    setError(null);
    setSearchQuery("");
  };

  const addItem = (item: Product | Service, type: "PRODUCT" | "SERVICE") => {
    const unitPrice =
      type === "PRODUCT"
        ? (item as Product).sellingPrice
        : (item as Service).price;
    const saleItem: SaleItem = {
      type,
      [type === "PRODUCT" ? "productId" : "serviceId"]: item.id,
      name: item.name,
      quantity: 1,
      unitPrice: unitPrice,
      totalAmount: unitPrice,
    };

    setSaleItems((prev) => [...prev, saleItem]);
    setSearchQuery("");
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    setSaleItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity, totalAmount: item.unitPrice * quantity }
          : item
      )
    );
  };

  const removeItem = (index: number) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return saleItems.reduce((sum, item) => sum + item.totalAmount, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return (
      subtotal - (formData.discountAmount || 0) + (formData.taxAmount || 0)
    );
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saleItems.length === 0) {
      setError("Please add at least one item to the sale");
      return;
    }

    const total = calculateTotal();
    if (formData.paymentAmount > total) {
      setError("Payment amount cannot exceed total amount");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const saleRequest: CreateSaleRequest = {
        ...formData,
        items: saleItems.map((item) => ({
          type: item.type,
          productId: item.productId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          scheduledFor: item.scheduledFor,
        })),
      };

      await salesService.create(saleRequest);
      onSaleCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sale");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Create New Sale</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer (Optional)
            </label>
            <select
              value={formData.customerId || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customerId: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Walk-in Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} {customer.phone && `(${customer.phone})`}
                </option>
              ))}
            </select>
          </div>

          {/* Add Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Items</h3>

            {/* Item Type Selector */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setSelectedItemType("PRODUCT")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedItemType === "PRODUCT"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Products
              </button>
              <button
                type="button"
                onClick={() => setSelectedItemType("SERVICE")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedItemType === "SERVICE"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Services
              </button>
            </div>

            {/* Search */}
            <Input
              type="text"
              placeholder={`Search ${selectedItemType.toLowerCase()}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Items List */}
            {searchQuery && (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {selectedItemType === "PRODUCT"
                  ? filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addItem(product, "PRODUCT")}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {product.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(product.sellingPrice)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Stock: {product.currentStock}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  : filteredServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => addItem(service, "SERVICE")}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {service.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {service.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(service.price)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {service.duration} min
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </div>

          {/* Sale Items */}
          {saleItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Sale Items
              </h3>
              <div className="space-y-2">
                {saleItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItemQuantity(
                            index,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">×</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(item.unitPrice)}
                      </span>
                      <span className="text-sm text-gray-600">=</span>
                      <span className="font-semibold text-gray-900 w-24 text-right">
                        {formatCurrency(item.totalAmount)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sale Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Type
              </label>
              <select
                value={formData.saleType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    saleType: e.target.value as
                      | "CASH"
                      | "CREDIT"
                      | "PARTIAL_PAYMENT",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CASH">Cash Sale</option>
                <option value="CREDIT">Credit Sale</option>
                <option value="PARTIAL_PAYMENT">Partial Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value as
                      | "CASH"
                      | "MPESA"
                      | "BANK_TRANSFER"
                      | "CARD",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CASH">Cash</option>
                <option value="MPESA">M-Pesa</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
              </select>
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.taxAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      taxAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>-{formatCurrency(formData.discountAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>+{formatCurrency(formData.taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={calculateTotal()}
                value={formData.paymentAmount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentAmount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
              <p className="text-sm text-gray-600 mt-1">
                Amount due:{" "}
                {formatCurrency(calculateTotal() - formData.paymentAmount)}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about this sale..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || saleItems.length === 0}
              className="min-w-[120px]"
            >
              {loading ? <LoadingSpinner /> : "Create Sale"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateSaleModal;
