// Products API service
import api from "./api";
import type { Product, CreateProductRequest, StockAlert } from "../types/sales";

export const productsService = {
  // Add new product
  create: async (productData: CreateProductRequest): Promise<Product> => {
    const response = await api.post("/products", productData);
    return response.data.product;
  },

  // Get all products
  getAll: async (filters?: {
    category?: string;
    stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
    search?: string;
  }): Promise<{
    products: Product[];
    summary: {
      totalProducts: number;
      inStock: number;
      lowStock: number;
      outOfStock: number;
      totalInventoryValue: number;
    };
  }> => {
    const response = await api.get("/products", { params: filters });
    return response.data;
  },

  // Get product by ID
  getById: async (productId: number): Promise<Product> => {
    const response = await api.get(`/products/${productId}`);
    return response.data.product;
  },

  // Update product
  update: async (
    productId: number,
    productData: Partial<Product>
  ): Promise<Product> => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data.product;
  },

  // Delete product
  delete: async (productId: number): Promise<void> => {
    await api.delete(`/products/${productId}`);
  },

  // Get low stock alerts
  getLowStockAlerts: async (): Promise<{
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    alerts: StockAlert[];
  }> => {
    const response = await api.get("/sales/alerts/low-stock");
    return response.data;
  },

  // Update stock levels
  updateStock: async (
    productId: number,
    data: {
      newStock: number;
      reason: string;
      notes?: string;
    }
  ): Promise<{
    product: Product;
    stockChange: {
      previousStock: number;
      newStock: number;
      change: number;
      reason: string;
    };
  }> => {
    const response = await api.post(`/products/${productId}/stock`, data);
    return response.data;
  },
};
