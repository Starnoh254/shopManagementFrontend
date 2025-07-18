// Customer API service
import api from "./api";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  totalDebt?: number; // Make optional since backend might not provide it
  creditBalance?: number; // New field for credit balance
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  lastPaymentDate?: string;
  balance?: {
    totalDebt: number;
    creditBalance: number;
    netBalance: number;
    status: "DEBT" | "CREDIT" | "BALANCED";
  };
}

export interface CustomerWithDetails extends Customer {
  debts: Debt[];
  payments: Payment[];
}

export interface Debt {
  id: number;
  amount: number;
  description: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  amount: number;
  method: "CASH" | "MOBILE_MONEY";
  description: string;
  createdAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get("/customers/all");
    // Transform the response to include balance information and defaults
    return response.data.customers.map(
      (customer: {
        id: number;
        name: string;
        phone: string;
        status: "ACTIVE" | "INACTIVE";
        createdAt: string;
        lastPaymentDate?: string;
        totalDebt?: number;
        creditBalance?: number;
        balance?: {
          totalDebt: number;
          creditBalance: number;
          netBalance: number;
          status: "DEBT" | "CREDIT" | "BALANCED";
        };
      }) => ({
        ...customer,
        totalDebt: customer.totalDebt || 0, // Default to 0 if not provided by backend
        creditBalance: customer.creditBalance || 0, // Default to 0 if not provided
        // If balance object is provided by backend, use it; otherwise create a basic one
        balance: customer.balance || {
          totalDebt: customer.totalDebt || 0,
          creditBalance: customer.creditBalance || 0,
          netBalance: (customer.creditBalance || 0) - (customer.totalDebt || 0),
          status:
            (customer.creditBalance || 0) > (customer.totalDebt || 0)
              ? "CREDIT"
              : (customer.totalDebt || 0) > (customer.creditBalance || 0)
              ? "DEBT"
              : "BALANCED",
        },
      })
    );
  },

  getById: async (id: number): Promise<CustomerWithDetails> => {
    const response = await api.get(`/customers/${id}`);
    return response.data.customer;
  },

  create: async (customerData: CreateCustomerRequest): Promise<Customer> => {
    const response = await api.post("/customers/create", customerData);
    return response.data.customer;
  },

  update: async (
    id: number,
    customerData: UpdateCustomerRequest
  ): Promise<void> => {
    await api.put(`/customers/${id}`, customerData);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  // Get customers with debts - returns customers with calculated total debt
  getWithDebts: async (): Promise<
    Array<{
      id: number;
      name: string;
      phone: string;
      totalDebt: number;
    }>
  > => {
    const response = await api.get("/debts/customers-with-debts");
    const { customers } = response.data;

    // Transform the backend response to match the expected structure
    return customers
      .map(
        (customer: {
          id: number;
          name: string;
          phone: string;
          debts: Array<{
            amount: number;
            isPaid: boolean;
          }>;
        }) => {
          // Calculate total debt from unpaid debts
          const totalDebt = customer.debts
            .filter((debt) => !debt.isPaid)
            .reduce((sum, debt) => sum + debt.amount, 0);

          return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            totalDebt,
          };
        }
      )
      .filter((customer: { totalDebt: number }) => customer.totalDebt > 0); // Only return customers with actual debt
  },

  getHistory: async (id: number) => {
    const response = await api.get(`/customers/${id}/history`);
    return response.data.history;
  },
};
