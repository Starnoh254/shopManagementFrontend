import React, { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import LoadingSpinner from "../ui/LoadingSpinner";
import { salesService } from "../../services/salesService";
import type { Sale } from "../../types/sales";

interface SaleDetailsProps {
  sale: Sale;
  onBack: () => void;
  onSaleUpdate: (updatedSale: Sale) => void;
}

const SaleDetails: React.FC<SaleDetailsProps> = ({
  sale,
  onBack,
  onSaleUpdate,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "MPESA" | "BANK_TRANSFER" | "CARD"
  >("CASH");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return `Ksh ${amount.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (amountDue: number) => {
    if (amountDue === 0) {
      return "bg-green-100 text-green-800";
    } else if (amountDue > 0 && amountDue < sale.totalAmount) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  const getPaymentStatusText = (amountDue: number) => {
    if (amountDue === 0) {
      return "FULLY PAID";
    } else if (amountDue > 0 && amountDue < sale.totalAmount) {
      return "PARTIALLY PAID";
    } else {
      return "UNPAID";
    }
  };

  const handleAddPayment = async () => {
    if (paymentAmount <= 0 || paymentAmount > sale.amountDue) {
      setError("Invalid payment amount");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await salesService.addPayment(sale.id, {
        paymentAmount,
        paymentMethod,
        notes: paymentNotes,
      });

      // Update the sale with new payment status
      const updatedSale: Sale = {
        ...sale,
        paidAmount: sale.totalAmount - response.remainingBalance,
        amountDue: response.remainingBalance,
        status:
          response.remainingBalance === 0 ? "COMPLETED" : "PARTIAL_PAYMENT",
      };

      onSaleUpdate(updatedSale);
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setPaymentNotes("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process payment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sale #{sale.id}
            </h1>
            <p className="text-sm text-gray-600">{sale.saleNumber}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
              sale.status
            )}`}
          >
            {sale.status}
          </span>
          <span
            className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPaymentStatusColor(
              sale.amountDue
            )}`}
          >
            {getPaymentStatusText(sale.amountDue)}
          </span>
          {sale.amountDue > 0 && (
            <Button onClick={() => setShowPaymentModal(true)} size="sm">
              Add Payment
            </Button>
          )}
        </div>
      </div>

      {/* Sale Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Sale Info */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sale Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium text-gray-900">
                {sale.customerName || "Walk-in Customer"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sale Date</p>
              <p className="font-medium text-gray-900">
                {formatDateTime(sale.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sale Type</p>
              <p className="font-medium text-gray-900">{sale.saleType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium text-gray-900">{sale.paymentMethod}</p>
            </div>
            {sale.notes && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Notes</p>
                <p className="font-medium text-gray-900">{sale.notes}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Financial Summary */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {formatCurrency(sale.subtotal)}
              </span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(sale.discountAmount)}
                </span>
              </div>
            )}
            {sale.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  {formatCurrency(sale.taxAmount)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(sale.totalAmount)}
                </span>
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(sale.paidAmount)}
                </span>
              </div>
              {sale.amountDue > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Due</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(sale.amountDue)}
                  </span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Profit</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(sale.totalProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-medium text-green-600">
                  {sale.profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sale Items */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sale Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Item
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Type
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Qty
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Unit Price
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Total
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Profit
                </th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.scheduledFor && (
                        <p className="text-sm text-gray-600">
                          Scheduled: {formatDateTime(item.scheduledFor)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.type === "PRODUCT"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(item.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {formatCurrency(item.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        size="lg"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold">
                {formatCurrency(sale.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Already Paid:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(sale.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-900 font-semibold">Amount Due:</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(sale.amountDue)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={sale.amountDue}
              value={paymentAmount}
              onChange={(e) =>
                setPaymentAmount(parseFloat(e.target.value) || 0)
              }
              placeholder="Enter payment amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as "CASH" | "MPESA" | "BANK_TRANSFER" | "CARD"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="CASH">Cash</option>
              <option value="MPESA">M-Pesa</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about this payment..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPayment}
              disabled={
                loading || paymentAmount <= 0 || paymentAmount > sale.amountDue
              }
            >
              {loading ? <LoadingSpinner /> : "Add Payment"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SaleDetails;
