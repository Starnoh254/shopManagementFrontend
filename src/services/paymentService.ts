// Payment API service
import api from "./api";

export interface Payment {
  id: number;
  customerId: number;
  customerName?: string;
  debtId: number;
  amount: number;
  appliedToDebt?: number; // Amount applied to debt (for overpayments)
  creditAmount?: number; // Amount added to credit balance
  method: "CASH" | "MOBILE_MONEY";
  description: string;
  createdAt: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  payment: {
    id: number;
    amount: number;
    appliedToDebt: number;
    creditAmount: number;
    paymentMethod: string;
  };
  summary: {
    totalPaid: number;
    appliedToDebt: number;
    creditAdded: number;
    previousCredit: number;
    newCreditBalance: number;
    remainingDebt: number;
  };
}

export interface CreditApplicationResponse {
  success: boolean;
  message: string;
  summary: {
    creditApplied: number;
    previousCreditBalance: number;
    newCreditBalance: number;
    debtsPaid: Array<{
      debtId: number;
      amount: number;
      description: string;
      partial: boolean;
    }>;
    remainingDebt: number;
  };
}

export interface ApplyCreditRequest {
  creditAmount?: number; // Optional: specific amount to apply
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
  debtId?: number; // Make optional for general payments
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
  record: async (
    paymentData: CreatePaymentRequest
  ): Promise<PaymentResponse> => {
    const response = await api.post("/payments/record", paymentData);
    return response.data;
  },

  // Apply credit to customer debts (POST /payments/apply-credit/:customerId)
  applyCredit: async (
    customerId: number,
    requestData?: ApplyCreditRequest
  ): Promise<CreditApplicationResponse> => {
    const response = await api.post(
      `/payments/apply-credit/${customerId}`,
      requestData || {}
    );
    return response.data;
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
    const response = await paymentService.record(paymentData);
    return {
      id: response.payment.id,
      customerId: paymentData.customerId,
      debtId: paymentData.debtId || 0,
      amount: response.payment.amount,
      appliedToDebt: response.payment.appliedToDebt,
      creditAmount: response.payment.creditAmount,
      method: response.payment.paymentMethod as "CASH" | "MOBILE_MONEY",
      description: paymentData.description || "",
      createdAt: new Date().toISOString(),
    };
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
