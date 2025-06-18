import React, { useState } from "react";
import axiosInstance from "../../api/axios"; // your axios setup
import { getAuthHeaders } from "../../utils/getAuthHeaders";

const NewDebt: React.FC = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await axiosInstance.post(
        "/customer/add",
        { name, phone, amount },
        {
          headers: getAuthHeaders(),
        }
      );
      setSuccess("Debt record added successfully ✅");
      setName("");
      setPhone("");
      setAmount(0);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.log(`Something went wrong : ${err}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Add New Debt
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        {success && (
          <p className="text-green-500 text-sm mb-4 text-center">{success}</p>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 mb-1">
            Amount Owed
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-primary-dark transition"
        >
          Add Debt
        </button>
      </form>
    </div>
  );
};

export default NewDebt;
