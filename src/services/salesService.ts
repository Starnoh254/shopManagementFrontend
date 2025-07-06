// Sales API service
import api from "./api";
import type {
  Sale,
  CreateSaleRequest,
  SalesAnalytics,
  DashboardData,
  TopProduct,
  ProfitLossData,
} from "../types/sales";

export const salesService = {
  // Create a new sale
  create: async (
    saleData: CreateSaleRequest
  ): Promise<{
    sale: Sale;
    inventoryUpdates: Array<{
      productId: number;
      previousStock: number;
      newStock: number;
      quantitySold: number;
    }>;
  }> => {
    const response = await api.post("/sales", saleData);
    return response.data;
  },

  // Get sale by ID
  getById: async (saleId: number): Promise<Sale> => {
    const response = await api.get(`/sales/${saleId}`);
    return response.data.sale;
  },

  // Get sales history with filters
  getAll: async (filters?: {
    startDate?: string;
    endDate?: string;
    customerId?: number;
    status?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    sales: Sale[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
    summary: SalesAnalytics;
  }> => {
    const response = await api.get("/sales", { params: filters });
    return response.data;
  },

  // Process additional payment for partial payments
  addPayment: async (
    saleId: number,
    paymentData: {
      paymentAmount: number;
      paymentMethod: string;
      notes?: string;
    }
  ): Promise<{
    payment: {
      id: number;
      amount: number;
      method: string;
      status: string;
      createdAt: string;
    };
    sale: Sale;
    remainingBalance: number;
  }> => {
    const response = await api.post(`/sales/${saleId}/payment`, paymentData);
    return response.data.result;
  },

  // Get daily sales summary
  getDailySummary: async (
    date?: string
  ): Promise<{
    date: string;
    summary: SalesAnalytics;
    hourlyBreakdown: Array<{
      hour: number;
      sales: number;
      revenue: number;
      profit: number;
    }>;
  }> => {
    const params = date ? { date } : {};
    const response = await api.get("/sales/analytics/daily", { params });
    return response.data;
  },

  // Get comprehensive analytics
  getAnalytics: async (filters?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "hour" | "day" | "week" | "month" | "year";
  }): Promise<{
    groupBy: string;
    periods: Array<{
      period: string;
      salesCount: number;
      totalRevenue: number;
      totalProfit: number;
      averageOrderValue: number;
      profitMargin: number;
    }>;
    totals: SalesAnalytics;
  }> => {
    const response = await api.get("/sales/analytics/overview", {
      params: filters,
    });
    return response.data;
  },

  // Get profit/loss report
  getProfitLoss: async (filters?: {
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month" | "year";
  }): Promise<ProfitLossData> => {
    const response = await api.get("/sales/analytics/profit-loss", {
      params: filters,
    });
    return response.data;
  },

  // Get top selling products
  getTopProducts: async (filters?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<TopProduct[]> => {
    const response = await api.get("/sales/analytics/top-products", {
      params: filters,
    });
    return response.data.products;
  },

  // Get dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get("/dashboard");
    return response.data.dashboard;
  },
};
