# Debt Management System API Documentation

## Overview

This is a REST API for a debt management system that helps shop owners track customer debts, payments, and transaction history. The system includes user authentication, customer management, and automated SMS notifications.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All API endpoints (except auth routes) require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 🔐 Authentication Routes

**Base Path:** `/auth`

#### 1. Register User

- **Endpoint:** `POST /auth/register`
- **Description:** Create a new user account
- **Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

- **Success Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### 2. Login User

- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate user and get JWT token
- **Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

- **Success Response (200):**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 👥 Customer Management Routes

**Base Path:** `/customer`
**Note:** All routes require authentication

#### 1. Add Customer / Add Debt

- **Endpoint:** `POST /customer/add`
- **Description:** Add a new customer or add debt to existing customer
- **Body:**

```json
{
  "name": "Jane Smith",
  "phone": "+254712345678",
  "amount": 500,
  "status": "active",
  "description": "Water bottles purchase" // optional
}
```

- **Success Response (201):**

```json
{
  "message": "Customer Details entered successfully",
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "phone": "+254712345678",
    "amountOwed": 500,
    "is_paid": false,
    "userId": 1,
    "createdAt": "2025-01-01T12:00:00.000Z"
  }
}
```

#### 2. Deduct Debt / Record Payment

- **Endpoint:** `POST /customer/deductDebt`
- **Description:** Record a payment and reduce customer debt
- **Body:**

```json
{
  "customerId": 1,
  "amount": 200
}
```

- **Success Response (201):**

```json
{
  "message": "Customer Details updated successfully",
  "user": {
    "id": 1,
    "name": "Jane Smith",
    "amountOwed": 300,
    "is_paid": false
  }
}
```

#### 3. Get All Customers

- **Endpoint:** `GET /customer/getAllCustomers`
- **Description:** Get all customers for the authenticated user
- **Success Response (200):**

```json
{
  "customers": [
    {
      "id": 1,
      "name": "Jane Smith",
      "phone": "+254712345678",
      "amountOwed": 300,
      "is_paid": false,
      "userId": 1,
      "createdAt": "2025-01-01T12:00:00.000Z"
    },
    {
      "id": 2,
      "name": "John Doe",
      "phone": "+254787654321",
      "amountOwed": 0,
      "is_paid": true,
      "userId": 1,
      "createdAt": "2025-01-02T10:30:00.000Z"
    }
  ]
}
```

#### 4. Get Customers with Outstanding Debts

- **Endpoint:** `GET /customer/getCustomersWithDebts`
- **Description:** Get only customers who have outstanding debts (amountOwed > 0)
- **Success Response (200):**

```json
{
  "customers": [
    {
      "id": 1,
      "name": "Jane Smith",
      "phone": "+254712345678",
      "amountOwed": 300,
      "is_paid": false,
      "userId": 1,
      "createdAt": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

#### 5. Get Customer Transaction History

- **Endpoint:** `GET /customer/:customerId/history`
- **Description:** Get chronological transaction history for a specific customer
- **Success Response (200):**

```json
{
  "history": [
    {
      "id": 3,
      "customerId": 1,
      "amount": 200,
      "type": "PAYMENT",
      "description": "Payment received",
      "createdAt": "2025-01-03T14:20:00.000Z",
      "userId": 1
    },
    {
      "id": 2,
      "customerId": 1,
      "amount": 300,
      "type": "DEBT",
      "description": "Additional purchase",
      "createdAt": "2025-01-02T11:15:00.000Z",
      "userId": 1
    },
    {
      "id": 1,
      "customerId": 1,
      "amount": 200,
      "type": "DEBT",
      "description": "Initial debt",
      "createdAt": "2025-01-01T12:00:00.000Z",
      "userId": 1
    }
  ]
}
```

#### 6. Get Customer with Full Details

- **Endpoint:** `GET /customer/:customerId/details`
- **Description:** Get customer information including complete transaction history
- **Success Response (200):**

```json
{
  "customer": {
    "id": 1,
    "name": "Jane Smith",
    "phone": "+254712345678",
    "amountOwed": 300,
    "is_paid": false,
    "userId": 1,
    "createdAt": "2025-01-01T12:00:00.000Z",
    "transactions": [
      {
        "id": 3,
        "amount": 200,
        "type": "PAYMENT",
        "description": "Payment received",
        "createdAt": "2025-01-03T14:20:00.000Z"
      },
      {
        "id": 2,
        "amount": 300,
        "type": "DEBT",
        "description": "Additional purchase",
        "createdAt": "2025-01-02T11:15:00.000Z"
      }
    ]
  }
}
```

---

## Error Responses

### Authentication Errors

- **401 Unauthorized:**

```json
{
  "message": "No token provided"
}
```

```json
{
  "message": "Invalid token"
}
```

### Validation Errors

- **400 Bad Request:**

```json
{
  "message": "User already exists"
}
```

### Server Errors

- **500 Internal Server Error:**

```json
{
  "message": "Server error",
  "error": "Detailed error message"
}
```

### Not Found Errors

- **404 Not Found:**

```json
{
  "message": "Customer not found"
}
```

---

## Data Models

### User

```javascript
{
  id: number,
  name: string,
  email: string,
  password: string (hashed),
  createdAt: DateTime
}
```

### Customer

```javascript
{
  id: number,
  name: string,
  phone: string (unique),
  amountOwed: number,
  is_paid: boolean,
  userId: number,
  createdAt: DateTime
}
```

### Transaction

```javascript
{
  id: number,
  customerId: number,
  amount: number,
  type: "DEBT" | "PAYMENT",
  description: string,
  createdAt: DateTime,
  userId: number
}
```

---

## Business Logic

### Debt Management Flow

1. **Adding New Customer:** Creates customer record + initial debt transaction
2. **Adding Debt to Existing Customer:** Updates amountOwed + creates debt transaction
3. **Recording Payment:** Reduces amountOwed + creates payment transaction
4. **SMS Notifications:** Automatically sent when debt reaches ≥ 200 (configurable)

### Transaction Types

- **DEBT:** Money owed by customer (positive amount)
- **PAYMENT:** Money paid by customer (positive amount, reduces total debt)

### Payment Logic

- Payments reduce the total `amountOwed`
- If payment amount exceeds debt, `amountOwed` becomes 0 (no negative debts)
- When `amountOwed` reaches 0, `is_paid` becomes `true`

---

## Frontend Integration Examples

### Login and Store Token

```javascript
const login = async (email, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  localStorage.setItem("token", data.token);
  return data;
};
```

### Make Authenticated Requests

```javascript
const getCustomers = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/customer/getAllCustomers", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.json();
};
```

### Add Customer/Debt

```javascript
const addDebt = async (customerData) => {
  const token = localStorage.getItem("token");
  const response = await fetch("/api/customer/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(customerData),
  });

  return response.json();
};
```

---

## Notes for Frontend Developers

1. **Token Management:** Store JWT token securely and include in all requests
2. **Error Handling:** Always check response status and handle errors appropriately
3. **Date Formatting:** All dates are in ISO 8601 format
4. **Phone Numbers:** Use international format (+254XXXXXXXXX)
5. **Transaction History:** Ordered by most recent first (descending)
6. **Real-time Updates:** Consider implementing periodic refresh for debt updates

---

## Environment Variables

```
DATABASE_URL="mysql://root:root@localhost:3306/water_shop"
JWT_SECRET="supersecret"
PORT=5000
```

## Contact

For questions about this API, contact the backend development team.
