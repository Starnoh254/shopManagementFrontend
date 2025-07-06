// Services API service
import api from "./api";
import type { Service, CreateServiceRequest } from "../types/sales";

export const servicesService = {
  // Add new service
  create: async (serviceData: CreateServiceRequest): Promise<Service> => {
    const response = await api.post("/services", serviceData);
    return response.data.service;
  },

  // Get all services
  getAll: async (filters?: {
    category?: string;
    requiresBooking?: boolean;
    search?: string;
  }): Promise<{
    services: Service[];
    summary: {
      totalServices: number;
      bookableServices: number;
      averagePrice: number;
      totalServiceRevenue: number;
    };
  }> => {
    const response = await api.get("/services", { params: filters });
    return response.data;
  },

  // Get service by ID
  getById: async (serviceId: number): Promise<Service> => {
    const response = await api.get(`/services/${serviceId}`);
    return response.data.service;
  },

  // Update service
  update: async (
    serviceId: number,
    serviceData: Partial<Service>
  ): Promise<Service> => {
    const response = await api.put(`/services/${serviceId}`, serviceData);
    return response.data.service;
  },

  // Delete service
  delete: async (serviceId: number): Promise<void> => {
    await api.delete(`/services/${serviceId}`);
  },

  // Get service categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get("/services/categories");
    return response.data.categories;
  },
};
