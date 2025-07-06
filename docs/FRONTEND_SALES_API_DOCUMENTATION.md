# Sales System API Documentation - Frontend Integration Guide

## 🎯 **Overview**

This API enables small business owners to manage both **product and service sales** digitally, replacing manual book records with real-time profit/loss tracking.

### **Base URL**: `https://your-api-domain.com/api`

### **Authentication**: Bearer token required for all endpoints

---

## 🏪 **1. BUSINESS SETUP ENDPOINTS**

### **1.1 Set Business Type**

Configure what the business sells (products, services, or both)

```http
POST /api/business/setup
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**

```json
{
  "businessType": "MIXED", // "PRODUCTS_ONLY", "SERVICES_ONLY", "MIXED"
  "businessName": "Mama Njeri General Store",
  "businessDescription": "General store with repair services",
  "currency": "KES",
  "defaultTaxRate": 16, // VAT percentage
  "businessAddress": "Kenyatta Market, Nairobi"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Business setup completed successfully",
  "business": {
    "id": 1,
    "businessType": "MIXED",
    "businessName": "Mama Njeri General Store",
    "currency": "KES",
    "defaultTaxRate": 16,
    "userId": 1,
    "createdAt": "2025-07-06T10:30:00Z"
  }
}
```

---

## 📦 **2. PRODUCT MANAGEMENT ENDPOINTS**

### **2.1 Add Product**

Add items that can be sold (physical goods)

```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Coca Cola 500ml",
  "description": "Cold soft drink",
  "category": "Beverages",
  "sellingPrice": 50,
  "costPrice": 35, // What you bought it for
  "sku": "COKE-500ML", // Optional product code
  "unit": "piece", // "piece", "kg", "liter", "meter", etc.
  "trackInventory": true, // Whether to track stock levels
  "initialStock": 100, // Starting inventory
  "reorderLevel": 20 // Alert when stock goes below this
}
```

**Response:**

```json
{
  "success": true,
  "message": "Product added successfully",
  "product": {
    "id": 1,
    "name": "Coca Cola 500ml",
    "category": "Beverages",
    "sellingPrice": 50,
    "costPrice": 35,
    "profitMargin": 42.86, // Calculated: (50-35)/35 * 100
    "sku": "COKE-500ML",
    "unit": "piece",
    "trackInventory": true,
    "currentStock": 100,
    "reorderLevel": 20,
    "stockStatus": "IN_STOCK", // "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"
    "userId": 1,
    "createdAt": "2025-07-06T10:30:00Z"
  }
}
```

### **2.2 Get All Products**

Retrieve all products with current stock levels

```http
GET /api/products
Authorization: Bearer {token}
```

**Query Parameters:**

- `category` (optional): Filter by category
- `stockStatus` (optional): "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"
- `search` (optional): Search by name or SKU

**Response:**

```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Coca Cola 500ml",
      "category": "Beverages",
      "sellingPrice": 50,
      "costPrice": 35,
      "profitMargin": 42.86,
      "currentStock": 85,
      "stockStatus": "IN_STOCK",
      "unit": "piece"
    },
    {
      "id": 2,
      "name": "Bread Loaf",
      "category": "Bakery",
      "sellingPrice": 60,
      "costPrice": 45,
      "profitMargin": 33.33,
      "currentStock": 15,
      "stockStatus": "LOW_STOCK",
      "unit": "piece"
    }
  ],
  "summary": {
    "totalProducts": 25,
    "inStock": 20,
    "lowStock": 3,
    "outOfStock": 2,
    "totalInventoryValue": 45600 // Current stock value at cost price
  }
}
```

---

## 🛠️ **3. SERVICE MANAGEMENT ENDPOINTS**

### **3.1 Add Service**

Add services that can be offered (labor, consultation, etc.)

```http
POST /api/services
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**

```json
{
  "name": "Phone Screen Repair",
  "description": "Smartphone screen replacement service",
  "category": "Electronics Repair",
  "price": 1500,
  "costEstimate": 800, // Materials + labor cost
  "duration": 60, // Minutes
  "requiresBooking": true, // Whether customer needs to book appointment
  "requiresMaterials": true, // Whether service uses inventory items
  "materials": [
    // Optional: materials used for this service
    {
      "productId": 5, // Screen replacement part
      "quantity": 1
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Service added successfully",
  "service": {
    "id": 1,
    "name": "Phone Screen Repair",
    "category": "Electronics Repair",
    "price": 1500,
    "costEstimate": 800,
    "profitMargin": 87.5, // (1500-800)/800 * 100
    "duration": 60,
    "requiresBooking": true,
    "requiresMaterials": true,
    "materials": [
      {
        "productId": 5,
        "productName": "Phone Screen - Samsung A10",
        "quantity": 1
      }
    ],
    "userId": 1,
    "createdAt": "2025-07-06T10:30:00Z"
  }
}
```

### **3.2 Get All Services**

Retrieve all available services

```http
GET /api/services
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "services": [
    {
      "id": 1,
      "name": "Phone Screen Repair",
      "category": "Electronics Repair",
      "price": 1500,
      "duration": 60,
      "requiresBooking": true,
      "profitMargin": 87.5
    },
    {
      "id": 2,
      "name": "Hair Cut",
      "category": "Beauty",
      "price": 300,
      "duration": 30,
      "requiresBooking": false,
      "profitMargin": 90.0
    }
  ]
}
```

---

## 🛒 **4. SALES TRANSACTION ENDPOINTS**

### **4.1 Create Sale**

Record a new sale (products, services, or both)

```http
POST /api/sales
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**

```json
{
  "customerId": 5, // Optional - can be null for walk-in customers
  "items": [
    {
      "type": "PRODUCT",
      "productId": 1, // Product ID
      "quantity": 2,
      "unitPrice": 50 // Optional - defaults to product selling price
    },
    {
      "type": "SERVICE",
      "serviceId": 1, // Service ID
      "quantity": 1,
      "unitPrice": 1500, // Optional - defaults to service price
      "scheduledFor": "2025-07-06T14:00:00Z" // For bookable services
    }
  ],
  "saleType": "CASH", // "CASH", "CREDIT", "PARTIAL_PAYMENT"
  "discountAmount": 50, // Optional discount
  "taxAmount": 240, // Optional tax amount
  "paymentAmount": 1650, // Amount being paid now
  "paymentMethod": "CASH", // "CASH", "MPESA", "BANK_TRANSFER", "CARD"
  "notes": "Customer requested express service"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Sale created successfully",
  "sale": {
    "id": 1,
    "saleNumber": "SALE-2025-001",
    "customerId": 5,
    "customerName": "John Doe",
    "saleType": "CASH",
    "status": "COMPLETED", // "COMPLETED", "PENDING", "PARTIAL_PAYMENT"
    "items": [
      {
        "id": 1,
        "type": "PRODUCT",
        "productId": 1,
        "name": "Coca Cola 500ml",
        "quantity": 2,
        "unitPrice": 50,
        "totalAmount": 100,
        "profit": 30 // (50-35) * 2
      },
      {
        "id": 2,
        "type": "SERVICE",
        "serviceId": 1,
        "name": "Phone Screen Repair",
        "quantity": 1,
        "unitPrice": 1500,
        "totalAmount": 1500,
        "profit": 700,
        "scheduledFor": "2025-07-06T14:00:00Z"
      }
    ],
    "subtotal": 1600,
    "discountAmount": 50,
    "taxAmount": 240,
    "totalAmount": 1790,
    "totalProfit": 730,
    "profitMargin": 40.78, // 730/1790 * 100
    "paidAmount": 1650,
    "amountDue": 140,
    "createdAt": "2025-07-06T11:15:00Z"
  },
  "inventoryUpdates": [
    {
      "productId": 1,
      "previousStock": 100,
      "newStock": 98,
      "quantitySold": 2
    }
  ]
}
```

### **4.2 Get Sale by ID**

Retrieve details of a specific sale

```http
GET /api/sales/{saleId}
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "sale": {
    "id": 1,
    "saleNumber": "SALE-2025-001",
    "customerId": 5,
    "customerName": "John Doe",
    "saleType": "CASH",
    "status": "COMPLETED",
    "totalAmount": 1790,
    "totalProfit": 730,
    "paidAmount": 1790,
    "amountDue": 0,
    "createdAt": "2025-07-06T11:15:00Z",
    "items": [
      {
        "id": 1,
        "type": "PRODUCT",
        "name": "Coca Cola 500ml",
        "quantity": 2,
        "unitPrice": 50,
        "totalAmount": 100,
        "profit": 30
      }
    ]
  }
}
```

### **4.3 Get Sales History**

Retrieve sales transactions with filtering

```http
GET /api/sales
Authorization: Bearer {token}
```

**Query Parameters:**

- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `customerId`: Filter by customer ID
- `status`: "COMPLETED", "PENDING", "PARTIAL_PAYMENT", "CANCELLED"
- `paymentMethod`: "CASH", "MPESA", "BANK_TRANSFER", "CARD"
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "sales": [
    {
      "id": 1,
      "saleNumber": "SALE-2025-001",
      "customerName": "John Doe",
      "totalAmount": 1790,
      "totalProfit": 730,
      "profitMargin": 40.78,
      "itemCount": 2,
      "status": "COMPLETED",
      "paymentMethod": "CASH",
      "createdAt": "2025-07-06T11:15:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 45,
    "itemsPerPage": 20
  },
  "summary": {
    "totalSales": 45,
    "totalRevenue": 89500,
    "totalProfit": 32650,
    "averageOrderValue": 1988.89
  }
}
```

### **4.4 Process Additional Payment**

Add payment to an existing sale (for partial payments)

```http
POST /api/sales/{saleId}/payment
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**

```json
{
  "paymentAmount": 500,
  "paymentMethod": "MPESA",
  "notes": "Partial payment via M-Pesa"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "result": {
    "payment": {
      "id": 15,
      "amount": 500,
      "method": "MPESA",
      "status": "COMPLETED",
      "createdAt": "2025-07-06T15:30:00Z"
    },
    "sale": {
      "id": 1,
      "totalAmount": 1790,
      "paidAmount": 1500,
      "status": "PARTIAL_PAYMENT"
    },
    "remainingBalance": 290
  }
}
```

---

## 📊 **5. ANALYTICS & REPORTS ENDPOINTS**

### **5.1 Daily Sales Summary**

Get today's sales performance

```http
GET /api/sales/analytics/daily
Authorization: Bearer {token}
```

**Query Parameters:**

- `date`: Specific date (YYYY-MM-DD, default: today)

**Response:**

```json
{
  "success": true,
  "date": "2025-07-06",
  "summary": {
    "totalSales": 12,
    "totalRevenue": 18750,
    "totalProfit": 7200,
    "profitMargin": 38.4,
    "averageOrderValue": 1562.5
  },
  "hourlyBreakdown": [
    { "hour": 8, "sales": 2, "revenue": 650, "profit": 245 },
    { "hour": 9, "sales": 3, "revenue": 1240, "profit": 520 },
    { "hour": 10, "sales": 1, "revenue": 1500, "profit": 700 }
  ]
}
```

### **5.2 Sales Analytics Overview**

Get comprehensive sales analytics with grouping

```http
GET /api/sales/analytics/overview
Authorization: Bearer {token}
```

**Query Parameters:**

- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `groupBy`: "hour", "day", "week", "month", "year" (default: "day")

**Response:**

```json
{
  "success": true,
  "groupBy": "day",
  "periods": [
    {
      "period": "2025-7-6",
      "salesCount": 12,
      "totalRevenue": 18750,
      "totalProfit": 7200,
      "averageOrderValue": 1562.5,
      "profitMargin": 38.4
    },
    {
      "period": "2025-7-5",
      "salesCount": 8,
      "totalRevenue": 12300,
      "totalProfit": 4850,
      "averageOrderValue": 1537.5,
      "profitMargin": 39.4
    }
  ],
  "totals": {
    "salesCount": 20,
    "totalRevenue": 31050,
    "totalProfit": 12050,
    "averageOrderValue": 1552.5
  }
}
    ],
    "salesByHour": [
      { "hour": 8, "sales": 2, "revenue": 650 },
      { "hour": 9, "sales": 3, "revenue": 1240 },
      { "hour": 10, "sales": 1, "revenue": 1500 }
    ]
  }
}
```

### **5.3 Profit/Loss Report**

Get comprehensive profit analysis

```http
GET /api/sales/analytics/profit-loss
Authorization: Bearer {token}
```

**Query Parameters:**

- `startDate`: Start date for analysis (YYYY-MM-DD)
- `endDate`: End date for analysis (YYYY-MM-DD)
- `groupBy`: "day", "week", "month", "year" (default: "day")

**Response:**

```json
{
  "success": true,
  "groupBy": "month",
  "periods": [
    {
      "period": "2025-7",
      "salesCount": 234,
      "totalRevenue": 456750,
      "totalProfit": 158250,
      "expenses": 0,
      "netProfit": 158250,
      "profitMargin": 34.65,
      "roi": 34.65
    }
  ],
  "summary": {
    "totalRevenue": 456750,
    "totalProfit": 158250,
    "totalExpenses": 0,
    "netProfit": 158250,
    "profitMargin": 34.65
  }
}
```

### **5.4 Top Selling Products**

Get best performing products by sales volume

```http
GET /api/sales/analytics/top-products
Authorization: Bearer {token}
```

**Query Parameters:**

- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `limit`: Number of products to return (default: 10)

**Response:**

```json
{
  "success": true,
  "products": [
    {
      "product": {
        "id": 1,
        "name": "Coca Cola 500ml",
        "category": "Beverages",
        "unit": "piece",
        "sellingPrice": 50
      },
      "quantitySold": 145,
      "revenue": 7250,
      "profit": 2175,
      "salesCount": 89,
      "averagePrice": 50
    },
    {
      "product": {
        "id": 5,
        "name": "Phone Screen - Samsung A10",
        "category": "Electronics",
        "unit": "piece",
        "sellingPrice": 800
      },
      "quantitySold": 25,
      "revenue": 20000,
      "profit": 12500,
      "salesCount": 25,
      "averagePrice": 800
    }
  ]
}
```

### **5.5 Inventory Alerts**

Get low stock and reorder alerts

```http
GET /api/sales/alerts/low-stock
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "totalAlerts": 5,
  "criticalAlerts": 2,
  "warningAlerts": 3,
  "alerts": [
    {
      "id": 2,
      "name": "Bread Loaf",
      "category": "Bakery",
      "currentStock": 0,
      "minStockLevel": 20,
      "stockStatus": "OUT_OF_STOCK",
      "unit": "piece",
      "sellingPrice": 60,
      "costPrice": 45,
      "alertLevel": "critical",
      "suggestedRestockQuantity": 40
    },
    {
      "id": 1,
      "name": "Coca Cola 500ml",
      "category": "Beverages",
      "currentStock": 8,
      "minStockLevel": 20,
      "stockStatus": "LOW_STOCK",
      "unit": "piece",
      "sellingPrice": 50,
      "costPrice": 35,
      "alertLevel": "warning",
      "suggestedRestockQuantity": 32
    }
  ]
}
```

---

## 🎯 **6. DASHBOARD OVERVIEW ENDPOINT**

### **6.1 Get Dashboard Data**

Single endpoint for dashboard overview

```http
GET /api/dashboard
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "dashboard": {
    "todaysSales": {
      "totalSales": 12,
      "revenue": 18750,
      "profit": 7200,
      "profitMargin": 38.4
    },
    "thisMonth": {
      "revenue": 456750,
      "profit": 158250,
      "growth": 15.6
    },
    "quickStats": {
      "totalProducts": 45,
      "totalServices": 8,
      "lowStockItems": 3,
      "pendingOrders": 0
    },
    "recentSales": [
      {
        "id": 15,
        "customerName": "Mary Wanjiku",
        "amount": 2500,
        "items": "2 item(s)",
        "time": "14:30"
      }
    ],
    "topSellingToday": [
      {
        "name": "Coca Cola 500ml",
        "quantitySold": 8,
        "revenue": 400
      }
    ],
    "stockAlerts": {
      "total": 5,
      "critical": 2,
      "warning": 3
    }
  }
}
```

### **6.2 Get Business Overview**

Comprehensive business analytics for different periods

```http
GET /api/dashboard/business-overview
Authorization: Bearer {token}
```

**Query Parameters:**

- `period`: "today", "week", "month", "year" (default: "month")

**Response:**

```json
{
  "success": true,
  "period": "month",
  "overview": {
    "salesMetrics": {
      "salesCount": 234,
      "totalRevenue": 456750,
      "totalProfit": 158250,
      "averageOrderValue": 1951.07
    },
    "profitLoss": {
      "totalRevenue": 456750,
      "totalProfit": 158250,
      "totalExpenses": 0,
      "netProfit": 158250,
      "profitMargin": 34.65
    },
    "topProducts": [
      {
        "product": {
          "id": 1,
          "name": "Coca Cola 500ml",
          "category": "Beverages"
        },
        "quantitySold": 145,
        "revenue": 7250,
        "profit": 2175
      }
    ],
    "trends": [
      {
        "period": "2025-7-1",
        "salesCount": 8,
        "totalRevenue": 12400,
        "totalProfit": 4800,
        "averageOrderValue": 1550,
        "profitMargin": 38.7
      }
    ]
  }
}
```

---

## 🚨 **Error Responses**

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "SPECIFIC_ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

**Common Error Codes:**

- `INSUFFICIENT_STOCK`: Not enough inventory for sale
- `INVALID_CUSTOMER`: Customer not found
- `INVALID_PRODUCT`: Product not found
- `INVALID_SERVICE`: Service not found
- `PERMISSION_DENIED`: User doesn't have access
- `VALIDATION_ERROR`: Request data validation failed

---

## 🔐 **Authentication**

Include JWT token in all requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📱 **Frontend Implementation Tips**

### **1. Progressive Enhancement**

Start with basic sales recording, then add advanced features:

1. Basic product/service addition
2. Simple sales recording
3. Customer management
4. Inventory tracking
5. Analytics and reports

### **2. Mobile-First Design**

Most small business owners use mobile phones:

- Large touch targets
- Simple forms
- Offline capability for basic operations
- Quick sale recording

### **3. Real-Time Updates**

- Show live profit calculations as items are added
- Update inventory counts immediately
- Display stock alerts prominently

### **4. Kenyan Business Context**

- Default currency: KES
- M-Pesa payment integration
- Support for Swahili language
- Simple receipt generation

This API provides everything needed to build a comprehensive sales management system for small businesses in Kenya! 🚀
