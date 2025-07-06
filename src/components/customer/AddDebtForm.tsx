import React, { useState } from "react";
import axiosInstance from "../../api/axios";
import { getAuthHeaders } from "../../utils/getAuthHeaders";

interface AddDebtProps {
  customerId: number;
  onSuccess: () => void;
}

const AddDebtForm: React.FC<AddDebtProps> = ({ customerId, onSuccess }) => {
  const [amount, setAmount] = useState<number>(0);
  //   const [dueDate, setDueDate] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post(
        `/customer/addDebt`,
        {
          id: customerId,
          amount,
        },
        {
          headers: getAuthHeaders(),
        }
      );
      alert("Debt added!");
      setAmount(0);
      onSuccess()
    } catch (err) {
      console.error("Failed to add debt", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-md shadow-md mb-4"
    >
      <h3 className="text-lg font-semibold mb-2">Add Debt</h3>
      <input
        type="number"
        placeholder="Amount (Ksh)"
        value={amount}
        onChange={(e) => setAmount(parseFloat(e.target.value))}
        required
        className="w-full px-4 py-2 mb-2 border rounded"
      />
      {/* <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
        className="w-full px-4 py-2 mb-2 border rounded"
      /> */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Debt
      </button>
    </form>
  );
};

export default AddDebtForm;
