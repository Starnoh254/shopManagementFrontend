// Payment API service
import api from "./api";

export interface Payment {
  id: number;
  customerId: number;
  customerName?: string;
  debtId: number;
  amount: number;
  method: "CASH" | "MOBILE_MONEY";
  description: string;
  createdAt: string;
}

export interface PaymentWithDetails extends Payment {
  customer: {
    id: number;
    name: string;
    phone: string;
  };
  debt: {
    id: number;
    amount: number;
    description: string;
  };
}

export interface CreatePaymentRequest {
  customerId: number;
  debtId: number;
  amount: number;
  method: "CASH" | "MOBILE_MONEY";
  description?: string;
}

export interface UpdatePaymentRequest {
  amount?: number;
  method?: "CASH" | "MOBILE_MONEY";
  description?: string;
}

export interface PaymentSummary {
  totalPayments: number;
  paymentCount: number;
  averagePayment: number;
  paymentMethods: {
    CASH: number;
    MOBILE_MONEY: number;
  };
}

export const paymentService = {
  // Record a new payment (POST /payments/record)
  record: async (paymentData: CreatePaymentRequest): Promise<Payment> => {
    const response = await api.post("/payments/record", paymentData);
    return response.data.payment;
  },

  // Get all payments for a specific customer (GET /payments/customer/:customerId)
  getCustomerPayments: async (customerId: number): Promise<Payment[]> => {
    const response = await api.get(`/payments/customer/${customerId}`);
    return response.data.payments;
  },

  // Get payment by ID (GET /payments/:paymentId)
  getById: async (paymentId: number): Promise<PaymentWithDetails> => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data.payment;
  },

  // Update payment (PUT /payments/:paymentId)
  update: async (
    paymentId: number,
    paymentData: UpdatePaymentRequest
  ): Promise<void> => {
    await api.put(`/payments/${paymentId}`, paymentData);
  },

  // Delete payment (DELETE /payments/:paymentId)
  delete: async (paymentId: number): Promise<void> => {
    await api.delete(`/payments/${paymentId}`);
  },

  // Get payment analytics (GET /payments/analytics)
  getAnalytics: async (filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: number;
  }): Promise<PaymentSummary> => {
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

    const response = await api.get(`/payments/analytics?${params.toString()}`);
    return response.data.analytics;
  },

  // Legacy alias for backward compatibility
  create: async (paymentData: CreatePaymentRequest): Promise<Payment> => {
    return paymentService.record(paymentData);
  },

  // Legacy alias for backward compatibility
  getByCustomer: async (customerId: number): Promise<Payment[]> => {
    return paymentService.getCustomerPayments(customerId);
  },

  // Legacy alias for backward compatibility
  getSummary: async (filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: number;
  }): Promise<PaymentSummary> => {
    return paymentService.getAnalytics(filters);
  },
};
