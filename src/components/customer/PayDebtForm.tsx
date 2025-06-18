import React, { useState } from "react";
import axiosInstance from "../../api/axios";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

interface PayDebtProps {
  customerId: number;
  onSuccess: () => void;
}

const PayDebtForm: React.FC<PayDebtProps> = ({ customerId , onSuccess }) => {
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post(
        `/customer/deductDebt`,
        {
          id: customerId,
          amount: amountPaid,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      alert("Payment recorded");
      setAmountPaid(0);
      onSuccess();
    } catch (err) {
      console.error("Failed to record payment", err);
    }
  };

  return (
    <form onSubmit={handlePay} className="p-4 border rounded-md shadow-md mb-4">
      <h3 className="text-lg font-semibold mb-2">Record Payment</h3>
      <input
        type="number"
        placeholder="Amount Paid (Ksh)"
        value={amountPaid}
        onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
        required
        className="w-full px-4 py-2 mb-2 border rounded"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Record Payment
      </button>
    </form>
  );
};

export default PayDebtForm;
