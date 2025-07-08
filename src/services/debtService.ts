// Debt API service
import api from "./api";

export interface Debt {
  id: number;
  customerId: number;
  customerName?: string;
  amount: number;
  remainingAmount?: number; // Optional since backend might not provide this
  description: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: string;
  createdAt: string;
  isPaid?: boolean; // For backend response compatibility
}

export interface DebtWithDetails extends Debt {
  customer: {
    id: number;
    name: string;
    phone: string;
  };
  payments: Array<{
    id: number;
    amount: number;
    method: string;
    createdAt: string;
  }>;
}

export interface CreateDebtRequest {
  customerId: number;
  amount: number;
  description: string;
  dueDate: string;
}

export interface UpdateDebtRequest {
  amount?: number;
  description?: string;
  dueDate?: string;
}

export const debtService = {
  // Add debt to customer (POST /debts/add)
  add: async (debtData: CreateDebtRequest): Promise<Debt> => {
    const response = await api.post("/debts/add", debtData);
    return response.data.debt;
  },

  // Get all debts for customer (GET /debts/customer/:customerId)
  getCustomerDebts: async (customerId: number): Promise<Debt[]> => {
    const response = await api.get(`/debts/customer/${customerId}`);
    return response.data.debts;
  },

  // Get unpaid debts for customer (GET /debts/customer/:customerId/unpaid)
  getCustomerUnpaidDebts: async (customerId: number): Promise<Debt[]> => {
    const response = await api.get(`/debts/customer/${customerId}/unpaid`);
    return response.data.debts;
  },

  // Get customers with unpaid debts (GET /debts/customers-with-debts)
  getCustomersWithUnpaidDebts: async (): Promise<
    Array<{
      id: number;
      name: string;
      phone: string;
      totalDebt: number;
      unpaidDebts: Debt[];
    }>
  > => {
    const response = await api.get("/debts/customers-with-debts");
    const { customers } = response.data;

    // Transform the backend response to match the expected UI structure
    return customers
      .map(
        (customer: {
          id: number;
          name: string;
          phone: string;
          debts: Array<{
            id: number;
            customerId: number;
            amount: number;
            remainingAmount?: number; // Optional since backend might not provide this
            description: string;
            status: string;
            dueDate: string;
            createdAt: string;
            isPaid: boolean;
          }>;
        }) => {
          // Filter for unpaid debts only
          const unpaidDebts = customer.debts
            .filter((debt) => !debt.isPaid)
            .map((debt) => ({
              id: debt.id,
              customerId: debt.customerId,
              amount: debt.amount,
              remainingAmount: debt.amount, // Set remainingAmount equal to amount since backend doesn't provide this field
              description: debt.description,
              status: debt.status as "PENDING" | "PAID" | "OVERDUE",
              dueDate: debt.dueDate,
              createdAt: debt.createdAt,
              isPaid: debt.isPaid,
            }));

          // Calculate total debt from unpaid debts
          const totalDebt = unpaidDebts.reduce(
            (sum, debt) => sum + debt.amount,
            0
          );

          return {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            totalDebt,
            unpaidDebts,
          };
        }
      )
      .filter(
        (customer: { unpaidDebts: Debt[] }) => customer.unpaidDebts.length > 0
      ); // Only return customers with actual unpaid debts
  },

  // Mark debt as paid (PUT /debts/:debtId/mark-paid)
  markAsPaid: async (debtId: number): Promise<void> => {
    await api.put(`/debts/${debtId}/mark-paid`);
  },

  // Update debt (PUT /debts/:debtId)
  update: async (
    debtId: number,
    debtData: UpdateDebtRequest
  ): Promise<void> => {
    await api.put(`/debts/${debtId}`, debtData);
  },

  // Delete debt (DELETE /debts/:debtId)
  delete: async (debtId: number): Promise<void> => {
    await api.delete(`/debts/${debtId}`);
  },

  // Get debt analytics (GET /debts/analytics)
  getAnalytics: async (filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: number;
  }): Promise<{
    totalDebts: number;
    totalAmount: number;
    unpaidAmount: number;
    overdueAmount: number;
    paidAmount: number;
  }> => {
    const params = new URLSearchParams();
    if (filters?.startDate) {
      params.append("startDate", filters.startDate);
    }
    if (filters?.endDate) {
      params.append("endDate", filters.endDate);
    }
    if (filters?.customerId) {
      params.append("customerId", filters.customerId.toString());
    }

    const response = await api.get(`/debts/analytics?${params.toString()}`);
    return response.data.analytics;
  },

  // Get all debts (GET /debts)
  getAll: async (): Promise<Debt[]> => {
    try {
      // Since there's no direct /debts endpoint, we'll get all customers with debts
      // and flatten the results to get all debts
      const customersWithDebts =
        await debtService.getCustomersWithUnpaidDebts();
      const allDebts = customersWithDebts.flatMap((customer) =>
        customer.unpaidDebts.map((debt) => ({
          ...debt,
          customerName: customer.name,
        }))
      );
      return allDebts;
    } catch (error) {
      console.error("Error fetching all debts:", error);
      return [];
    }
  },

  // Legacy aliases for backward compatibility
  create: async (debtData: CreateDebtRequest): Promise<Debt> => {
    return debtService.add(debtData);
  },

  getByCustomer: async (customerId: number): Promise<Debt[]> => {
    return debtService.getCustomerDebts(customerId);
  },

  // For overdue debts, we can get them from unpaid debts and filter by due date
  getOverdue: async (): Promise<Debt[]> => {
    try {
      const customersWithDebts =
        await debtService.getCustomersWithUnpaidDebts();
      const allUnpaidDebts = customersWithDebts.flatMap(
        (customer) => customer.unpaidDebts
      );
      const today = new Date();

      return allUnpaidDebts.filter((debt) => {
        const dueDate = new Date(debt.dueDate);
        return dueDate < today;
      });
    } catch (error) {
      console.error("Error fetching overdue debts:", error);
      return [];
    }
  },

  // Remove the getAll method since there's no general endpoint for all debts
  // If you need all debts, use getCustomersWithUnpaidDebts() and flatten the results
};
