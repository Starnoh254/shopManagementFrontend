# Frontend API Documentation - Shop Management System

## Overview

This documentation is specifically designed for frontend developers working with our modular debt management system. The API follows RESTful principles and is organized into distinct modules: **Authentication**, **Customers**, **Debts**, and **Payments**.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints (except auth routes) require a JWT token:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Module

### Login

**POST** `/auth/login`

**Request:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Register

**POST** `/auth/register`

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 👥 Customer Module

### Get All Customers

**GET** `/customers`

**Response:**

```json
{
  "success": true,
  "customers": [
    {
      "id": 1,
      "name": "Jane Smith",
      "phone": "+254712345678",
      "totalDebt": 500.0,
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "lastPaymentDate": "2024-01-10T14:20:00.000Z"
    }
  ]
}
```

### Get Single Customer

**GET** `/customers/:id`

**Response:**

```json
{
  "success": true,
  "customer": {
    "id": 1,
    "name": "Jane Smith",
    "phone": "+254712345678",
    "totalDebt": 500.0,
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "debts": [
      {
        "id": 1,
        "amount": 300.0,
        "description": "Water bottles - Week 1",
        "status": "PENDING",
        "dueDate": "2024-01-20T00:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "payments": [
      {
        "id": 1,
        "amount": 200.0,
        "method": "CASH",
        "description": "Partial payment",
        "createdAt": "2024-01-10T14:20:00.000Z"
      }
    ]
  }
}
```

### Create Customer

**POST** `/customers`

**Request:**

```json
{
  "name": "Jane Smith",
  "phone": "+254712345678",
  "status": "ACTIVE"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Customer created successfully",
  "customer": {
    "id": 1,
    "name": "Jane Smith",
    "phone": "+254712345678",
    "totalDebt": 0.0,
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Customer

**PUT** `/customers/:id`

**Request:**

```json
{
  "name": "Jane Smith Updated",
  "phone": "+254712345679",
  "status": "INACTIVE"
}
```

### Delete Customer

**DELETE** `/customers/:id`

**Response:**

```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

### Get Customers with Outstanding Debts

**GET** `/customers/with-debts`

**Response:**

```json
{
  "success": true,
  "customers": [
    {
      "id": 1,
      "name": "Jane Smith",
      "phone": "+254712345678",
      "totalDebt": 500.0,
      "overdueAmount": 200.0,
      "status": "ACTIVE"
    }
  ]
}
```

---

## 💰 Debt Module

### Get All Debts

**GET** `/debts`

**Query Parameters:**

- `customerId` (optional): Filter by customer
- `status` (optional): Filter by status (PENDING, PAID, OVERDUE)

**Response:**

```json
{
  "success": true,
  "debts": [
    {
      "id": 1,
      "customerId": 1,
      "customerName": "Jane Smith",
      "amount": 300.0,
      "remainingAmount": 100.0,
      "description": "Water bottles - Week 1",
      "status": "PENDING",
      "dueDate": "2024-01-20T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Single Debt

**GET** `/debts/:id`

**Response:**

```json
{
  "success": true,
  "debt": {
    "id": 1,
    "customerId": 1,
    "customer": {
      "id": 1,
      "name": "Jane Smith",
      "phone": "+254712345678"
    },
    "amount": 300.0,
    "remainingAmount": 100.0,
    "description": "Water bottles - Week 1",
    "status": "PENDING",
    "dueDate": "2024-01-20T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "payments": [
      {
        "id": 1,
        "amount": 200.0,
        "method": "CASH",
        "createdAt": "2024-01-10T14:20:00.000Z"
      }
    ]
  }
}
```

### Create Debt

**POST** `/debts`

**Request:**

```json
{
  "customerId": 1,
  "amount": 300.0,
  "description": "Water bottles - Week 1",
  "dueDate": "2024-01-20T00:00:00.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Debt created successfully",
  "debt": {
    "id": 1,
    "customerId": 1,
    "amount": 300.0,
    "remainingAmount": 300.0,
    "description": "Water bottles - Week 1",
    "status": "PENDING",
    "dueDate": "2024-01-20T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update Debt

**PUT** `/debts/:id`

**Request:**

```json
{
  "amount": 350.0,
  "description": "Water bottles - Week 1 (Updated)",
  "dueDate": "2024-01-25T00:00:00.000Z"
}
```

### Delete Debt

**DELETE** `/debts/:id`

### Get Customer's Debts

**GET** `/debts/customer/:customerId`

**Response:**

```json
{
  "success": true,
  "debts": [
    {
      "id": 1,
      "amount": 300.0,
      "remainingAmount": 100.0,
      "description": "Water bottles - Week 1",
      "status": "PENDING",
      "dueDate": "2024-01-20T00:00:00.000Z"
    }
  ]
}
```

### Get Overdue Debts

**GET** `/debts/overdue`

**Response:**

```json
{
  "success": true,
  "overdueDebts": [
    {
      "id": 1,
      "customerId": 1,
      "customerName": "Jane Smith",
      "customerPhone": "+254712345678",
      "amount": 300.0,
      "remainingAmount": 300.0,
      "daysOverdue": 5,
      "dueDate": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

---

## 💳 Payment Module

### Get All Payments

**GET** `/payments`

**Query Parameters:**

- `customerId` (optional): Filter by customer
- `debtId` (optional): Filter by debt
- `method` (optional): Filter by payment method

**Response:**

```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "customerId": 1,
      "customerName": "Jane Smith",
      "debtId": 1,
      "amount": 200.0,
      "method": "CASH",
      "description": "Partial payment",
      "createdAt": "2024-01-10T14:20:00.000Z"
    }
  ]
}
```

### Get Single Payment

**GET** `/payments/:id`

**Response:**

```json
{
  "success": true,
  "payment": {
    "id": 1,
    "customerId": 1,
    "customer": {
      "id": 1,
      "name": "Jane Smith",
      "phone": "+254712345678"
    },
    "debtId": 1,
    "debt": {
      "id": 1,
      "amount": 300.0,
      "description": "Water bottles - Week 1"
    },
    "amount": 200.0,
    "method": "CASH",
    "description": "Partial payment",
    "createdAt": "2024-01-10T14:20:00.000Z"
  }
}
```

### Record Payment

**POST** `/payments`

**Request:**

```json
{
  "customerId": 1,
  "debtId": 1,
  "amount": 200.0,
  "method": "CASH",
  "description": "Partial payment"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "payment": {
    "id": 1,
    "customerId": 1,
    "debtId": 1,
    "amount": 200.0,
    "method": "CASH",
    "description": "Partial payment",
    "createdAt": "2024-01-10T14:20:00.000Z"
  },
  "updatedDebt": {
    "id": 1,
    "remainingAmount": 100.0,
    "status": "PENDING"
  }
}
```

### Update Payment

**PUT** `/payments/:id`

**Request:**

```json
{
  "amount": 250.0,
  "method": "MOBILE_MONEY",
  "description": "Payment via M-Pesa"
}
```

### Delete Payment

**DELETE** `/payments/:id`

### Get Customer's Payments

**GET** `/payments/customer/:customerId`

**Response:**

```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "debtId": 1,
      "amount": 200.0,
      "method": "CASH",
      "description": "Partial payment",
      "createdAt": "2024-01-10T14:20:00.000Z"
    }
  ]
}
```

---

## 📊 Transaction History & Reports

### Get Customer Transaction History

**GET** `/customers/:id/history`

**Response:**

```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "type": "DEBT",
      "amount": 300.0,
      "description": "Water bottles - Week 1",
      "date": "2024-01-15T10:30:00.000Z",
      "balance": 300.0
    },
    {
      "id": 2,
      "type": "PAYMENT",
      "amount": 200.0,
      "description": "Partial payment",
      "date": "2024-01-10T14:20:00.000Z",
      "balance": 100.0
    }
  ]
}
```

### Get Payment Summary

**GET** `/payments/summary`

**Query Parameters:**

- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `customerId` (optional): Filter by customer

**Response:**

```json
{
  "success": true,
  "summary": {
    "totalPayments": 1500.0,
    "paymentCount": 8,
    "averagePayment": 187.5,
    "paymentMethods": {
      "CASH": 800.0,
      "MOBILE_MONEY": 700.0
    }
  }
}
```

---

## 🚨 Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)",
  "errors": ["Validation error 1", "Validation error 2"] // For validation errors
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate data)
- **500**: Internal Server Error

### Example Error Responses

**Validation Error (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Phone number is required", "Amount must be greater than 0"]
}
```

**Authentication Error (401):**

```json
{
  "success": false,
  "message": "No token provided"
}
```

**Not Found Error (404):**

```json
{
  "success": false,
  "message": "Customer not found"
}
```

---

## 💡 Frontend Integration Guide

### 1. Authentication Flow

```javascript
// Login and store token
const login = async (email, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
};

// Setup axios interceptor for automatic token inclusion
axios.defaults.baseURL = "http://localhost:5000/api";
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Error Handling

```javascript
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    localStorage.removeItem("token");
    window.location.href = "/login";
  } else if (error.response?.data?.errors) {
    // Show validation errors
    return error.response.data.errors;
  } else {
    // Show general error message
    return [error.response?.data?.message || "An error occurred"];
  }
};
```

### 3. Common Operations

```javascript
// Get customers with debts for dashboard
const getCustomersWithDebts = async () => {
  try {
    const response = await axios.get("/customers/with-debts");
    return response.data.customers;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Record a payment
const recordPayment = async (paymentData) => {
  try {
    const response = await axios.post("/payments", paymentData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get customer details with full history
const getCustomerDetails = async (customerId) => {
  try {
    const response = await axios.get(`/customers/${customerId}`);
    return response.data.customer;
  } catch (error) {
    throw handleApiError(error);
  }
};
```

### 4. Real-time Updates

```javascript
// Polling for updates (simple approach)
const pollForUpdates = () => {
  setInterval(async () => {
    try {
      const customers = await getCustomersWithDebts();
      updateCustomersList(customers);
    } catch (error) {
      console.error("Polling failed:", error);
    }
  }, 30000); // Poll every 30 seconds
};
```

---

## 🎯 Workflow Examples

### Adding a New Customer and Debt

```javascript
// Step 1: Create customer
const customer = await createCustomer({
  name: "John Doe",
  phone: "+254712345678",
});

// Step 2: Add debt for the customer
const debt = await createDebt({
  customerId: customer.id,
  amount: 500.0,
  description: "Water bottles - Week 1",
  dueDate: "2024-01-30T00:00:00.000Z",
});
```

### Recording Payment for a Debt

```javascript
// Get customer's pending debts
const debts = await getCustomerDebts(customerId);
const pendingDebt = debts.find((d) => d.status === "PENDING");

// Record payment
const payment = await recordPayment({
  customerId: customerId,
  debtId: pendingDebt.id,
  amount: 200.0,
  method: "CASH",
  description: "Partial payment",
});
```

### Dashboard Data Loading

```javascript
const loadDashboardData = async () => {
  try {
    const [customersWithDebts, overdueDebts, recentPayments] =
      await Promise.all([
        getCustomersWithDebts(),
        getOverdueDebts(),
        getPayments({ limit: 10 }),
      ]);

    setDashboardData({
      customersWithDebts,
      overdueDebts,
      recentPayments,
    });
  } catch (error) {
    setError(handleApiError(error));
  }
};
```

---

## 📱 Mobile-Specific Considerations

### Phone Number Formatting

```javascript
// Ensure phone numbers are in international format
const formatPhoneNumber = (phone) => {
  // Remove any non-digits
  const digits = phone.replace(/\D/g, "");

  // Add country code if not present
  if (digits.startsWith("7") && digits.length === 9) {
    return "+254" + digits;
  } else if (digits.startsWith("254")) {
    return "+" + digits;
  }

  return phone;
};
```

### Offline Support

```javascript
// Store pending actions when offline
const recordPaymentOffline = (paymentData) => {
  const pendingActions = JSON.parse(
    localStorage.getItem("pendingActions") || "[]"
  );
  pendingActions.push({
    type: "RECORD_PAYMENT",
    data: paymentData,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem("pendingActions", JSON.stringify(pendingActions));
};

// Sync when back online
const syncPendingActions = async () => {
  const pendingActions = JSON.parse(
    localStorage.getItem("pendingActions") || "[]"
  );

  for (const action of pendingActions) {
    try {
      if (action.type === "RECORD_PAYMENT") {
        await recordPayment(action.data);
      }
      // Remove successful action
      pendingActions.splice(pendingActions.indexOf(action), 1);
    } catch (error) {
      console.error("Failed to sync action:", error);
    }
  }

  localStorage.setItem("pendingActions", JSON.stringify(pendingActions));
};
```

---

## 🔧 Environment Configuration

### Development

```javascript
const API_BASE_URL = "http://localhost:5000/api";
```

### Production

```javascript
const API_BASE_URL = "https://your-domain.com/api";
```

---

## 📞 Support

For technical questions or issues with this API:

- Contact: Backend Development Team
- Email: backend@yourcompany.com
- Documentation: [Internal Wiki Link]

---

## 🔄 API Versioning

Current Version: **v1**

All endpoints are prefixed with `/api/` which represents version 1. Future versions will be available at `/api/v2/`, etc.

---

This documentation provides everything needed to integrate with our modular debt management system. The API is designed to be intuitive and follows REST conventions for predictable behavior.
