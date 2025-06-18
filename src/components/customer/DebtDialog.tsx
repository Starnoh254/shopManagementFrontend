import React from "react";

type Customer = {
  id: number;
  name: string;
  phone: string;
  amountOwed: number;
  is_paid: boolean;
  userId: number;
  createdAt: string;
};

interface DebtDialogProps {
  customer: Customer;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const DebtDialog: React.FC<DebtDialogProps> = ({ customer, title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
      <h3 className="text-lg font-bold mb-4">{title} for {customer.name}</h3>
      {children}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

export default DebtDialog;