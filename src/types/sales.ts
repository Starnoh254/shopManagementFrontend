// Sales Management Type Definitions

export interface BusinessSetup {
  id: number;
  businessType: "PRODUCTS_ONLY" | "SERVICES_ONLY" | "MIXED";
  businessName: string;
  businessDescription?: string;
  currency: string;
  defaultTaxRate: number;
  businessAddress?: string;
  userId: number;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  profitMargin: number;
  sku?: string;
  unit: string;
  trackInventory: boolean;
  currentStock: number;
  reorderLevel: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  userId: number;
  createdAt: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  costEstimate: number;
  profitMargin: number;
  duration: number; // minutes
  requiresBooking: boolean;
  requiresMaterials: boolean;
  status?: "active" | "inactive";
  materials?: Array<{
    productId: number;
    productName: string;
    quantity: number;
  }>;
  userId: number;
  createdAt: string;
}

export interface SaleItem {
  id?: number;
  type: "PRODUCT" | "SERVICE";
  productId?: number;
  serviceId?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  profit: number;
  scheduledFor?: string; // For services
}

export interface Sale {
  id: number;
  saleNumber: string;
  customerId?: number;
  customerName?: string;
  saleType: "CASH" | "CREDIT" | "PARTIAL_PAYMENT";
  status: "COMPLETED" | "PENDING" | "PARTIAL_PAYMENT" | "CANCELLED";
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  totalProfit: number;
  profitMargin: number;
  paidAmount: number;
  amountDue: number;
  paymentMethod: "CASH" | "MPESA" | "BANK_TRANSFER" | "CARD";
  notes?: string;
  createdAt: string;
}

export interface CreateSaleRequest {
  customerId?: number;
  items: Array<{
    type: "PRODUCT" | "SERVICE";
    productId?: number;
    serviceId?: number;
    quantity: number;
    unitPrice?: number;
    scheduledFor?: string;
  }>;
  saleType: "CASH" | "CREDIT" | "PARTIAL_PAYMENT";
  discountAmount?: number;
  taxAmount?: number;
  paymentAmount: number;
  paymentMethod: "CASH" | "MPESA" | "BANK_TRANSFER" | "CARD";
  notes?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  sku?: string;
  unit: string;
  trackInventory: boolean;
  initialStock?: number;
  reorderLevel?: number;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  category: string;
  price: number;
  costEstimate: number;
  duration: number;
  requiresBooking: boolean;
  requiresMaterials: boolean;
  materials?: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface SalesAnalytics {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  averageOrderValue: number;
}

export interface DashboardData {
  todaysSales: SalesAnalytics;
  thisMonth: {
    revenue: number;
    profit: number;
    growth: number;
  };
  quickStats: {
    totalProducts: number;
    totalServices: number;
    lowStockItems: number;
    pendingOrders: number;
  };
  recentSales: Array<{
    id: number;
    customerName: string;
    amount: number;
    items: string;
    time: string;
  }>;
  topSellingToday: Array<{
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
  stockAlerts: {
    total: number;
    critical: number;
    warning: number;
  };
}

export interface StockAlert {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  stockStatus: "OUT_OF_STOCK" | "LOW_STOCK";
  unit: string;
  sellingPrice: number;
  costPrice: number;
  alertLevel: "critical" | "warning";
  suggestedRestockQuantity: number;
}

export interface TopProduct {
  product: {
    id: number;
    name: string;
    category: string;
    unit: string;
    sellingPrice: number;
  };
  quantitySold: number;
  revenue: number;
  profit: number;
  salesCount: number;
  averagePrice: number;
}

export interface ProfitLossData {
  groupBy: string;
  periods: Array<{
    period: string;
    salesCount: number;
    totalRevenue: number;
    totalProfit: number;
    expenses: number;
    netProfit: number;
    profitMargin: number;
    roi: number;
  }>;
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
}
