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
    try {
      // First, get all customers with their debt information
      const debtResponse = await api.get("/debts/customers-with-debts");
      const customersWithDebts = debtResponse.data.customers;

      // Create a map of customer IDs to their total debt
      const customerDebtMap = new Map<number, number>();

      customersWithDebts.forEach(
        (customer: {
          id: number;
          debts: Array<{
            amount: number;
            isPaid: boolean;
          }>;
        }) => {
          // Calculate total unpaid debt for this customer
          const totalDebt = customer.debts
            .filter((debt) => !debt.isPaid)
            .reduce((sum, debt) => sum + debt.amount, 0);

          customerDebtMap.set(customer.id, totalDebt);
        }
      );

      // Now get all customers from the main endpoint
      const customerResponse = await api.get("/customers/all");
      const allCustomers = customerResponse.data.customers;

      // Merge the debt information with customer data
      return allCustomers.map(
        (customer: {
          id: number;
          name: string;
          phone: string;
          status: "ACTIVE" | "INACTIVE";
          createdAt: string;
          lastPaymentDate?: string;
        }) => ({
          ...customer,
          totalDebt: customerDebtMap.get(customer.id) || 0, // Get actual debt or default to 0
        })
      );
    } catch (error) {
      console.error("Error fetching customers with debt data:", error);

      // Fallback: just get basic customer data without debt info
      try {
        const response = await api.get("/customers/all");
        return response.data.customers.map(
          (customer: {
            id: number;
            name: string;
            phone: string;
            status: "ACTIVE" | "INACTIVE";
            createdAt: string;
            lastPaymentDate?: string;
          }) => ({
            ...customer,
            totalDebt: 0, // Default to 0 if debt data unavailable
          })
        );
      } catch (fallbackError) {
        console.error("Error fetching basic customer data:", fallbackError);
        throw fallbackError;
      }
    }
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
