import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { getAuthHeaders } from "../../utils/getAuthHeaders";
import AddDebtForm from "./AddDebtForm";
import PayDebtForm from "./PayDebtForm";
import DebtDialog from "./DebtDialog";

type Customer = {
  id: number;
  name: string;
  phone: string;
  amountOwed: number;
  is_paid: boolean;
  userId: number;
  createdAt: string;
};

const AllDebtsList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dialog, setDialog] = useState<{
    type: "add" | "subtract";
    customer: Customer;
  } | null>(null);

  const fetchDebts = async () => {
    try {
      const res = await axiosInstance.get("/customer/getAllCustomers", {
        headers: getAuthHeaders(),
      });
      setCustomers(res.data.customers);
    } catch (err) {
      console.error("Error fetching debts", err);
    }
  };
  useEffect(() => {
    fetchDebts();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Customer Debts</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-2 text-xs sm:text-sm">Name</th>
              <th className="p-2 text-xs sm:text-sm">Phone</th>
              <th className="p-2 text-xs sm:text-sm">Amount Owed (Ksh)</th>
              <th className="p-2 text-xs sm:text-sm">Status</th>
              <th className="p-2 text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-b hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <td className="p-2 text-xs sm:text-sm text-center">{c.name}</td>
                <td className="p-2 text-xs sm:text-sm text-center">
                  {c.phone}
                </td>
                <td className="p-2 text-red-500 font-bold text-xs sm:text-sm text-center">
                  {c.amountOwed.toFixed(2)}
                </td>
                <td className="p-2 text-xs sm:text-sm text-center">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs sm:text-sm ${
                      c.is_paid ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {c.is_paid ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td className="p-2 flex justify-center gap-2">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                    onClick={() => setDialog({ type: "add", customer: c })}
                  >
                    Add Debt
                  </button>
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                    onClick={() => setDialog({ type: "subtract", customer: c })}
                  >
                    Subtract Debt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      {dialog && (
        <DebtDialog
          customer={dialog.customer}
          title={dialog.type === "add" ? "Add Debt" : "Subtract Debt"}
          onClose={() => setDialog(null)}
        >
          {dialog.type === "add" ? (
            <AddDebtForm
              customerId={dialog.customer.id}
              onSuccess={() => {
                fetchDebts();
                setDialog(null);
              }}
            />
          ) : (
            <PayDebtForm
              customerId={dialog.customer.id}
              onSuccess={() => {
                fetchDebts();
                setDialog(null);
              }}
            />
          )}
        </DebtDialog>
      )}
    </div>
  );
};

export default AllDebtsList;
