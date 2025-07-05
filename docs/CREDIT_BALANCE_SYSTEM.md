# Credit Balance System - Handling Overpayments

## 🎯 **Problem Solved**

When customers pay more than they owe, the system now:

- ✅ Accepts overpayments
- ✅ Tracks credit balances
- ✅ Automatically applies credits to future purchases
- ✅ Shows clear balance information

## 💰 **How It Works**

### **Payment Flow:**

1. **Customer owes $100**
2. **Customer pays $150**
3. **System applies $100 to debt** (debt = $0)
4. **System adds $50 to credit balance**
5. **Next purchase automatically uses credit first**

### **Database Changes:**

```prisma
model Customer {
  creditBalance Float @default(0)  // New field
  // ...other fields
}

model Payment {
  amount        Float              // Total payment amount
  appliedToDebt Float @default(0)  // Amount that paid off debt
  creditAmount  Float @default(0)  // Amount added to credit
  // ...other fields
}
```

## 📊 **API Responses**

### **Payment with Overpayment:**

```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "payment": {
    "id": 1,
    "amount": 150,
    "appliedToDebt": 100,
    "creditAmount": 50,
    "paymentMethod": "CASH"
  },
  "summary": {
    "totalPaid": 150,
    "appliedToDebt": 100,
    "creditAdded": 50,
    "previousCredit": 0,
    "newCreditBalance": 50,
    "remainingDebt": 0
  }
}
```

### **Customer with Credit Balance:**

```json
{
  "success": true,
  "customer": {
    "id": 1,
    "name": "John Doe",
    "phone": "+254712345678",
    "creditBalance": 50,
    "balance": {
      "totalDebt": 0,
      "creditBalance": 50,
      "netBalance": 50,
      "status": "CREDIT"
    }
  }
}
```

## 🔄 **Business Scenarios**

### **Scenario 1: Simple Overpayment**

- Debt: $100
- Payment: $150
- Result: $0 debt, $50 credit

### **Scenario 2: Using Credit for New Purchase**

- Existing credit: $50
- New debt: $80
- Effective debt: $30 (automatically reduced by credit)
- Credit balance: $0

### **Scenario 3: Credit + Cash Payment**

- Existing credit: $30
- Current debt: $100
- Cash payment: $40
- Total applied: $70
- Remaining debt: $30

## 🔄 **How Credit Application Works**

### **Automatic Credit Application:**

#### **1. When Recording a Payment:**

```javascript
// Customer owes $100, pays $150
// System automatically:
// - Applies $100 to debt (debt becomes $0)
// - Adds $50 to credit balance
```

#### **2. When Adding New Debt:**

```javascript
// Customer has $50 credit, new debt of $80
// System automatically:
// - Applies $50 credit to new debt
// - Customer only owes $30
// - Credit balance becomes $0
```

### **Manual Credit Application:**

#### **API Endpoint:**

```
POST /api/payments/apply-credit/:customerId
```

#### **Request (Optional amount):**

```json
{
  "creditAmount": 30 // Optional: specific amount to apply
}
```

#### **Response:**

```json
{
  "success": true,
  "message": "Credit applied to debts successfully",
  "summary": {
    "creditApplied": 50,
    "previousCreditBalance": 50,
    "newCreditBalance": 0,
    "debtsPaid": [
      {
        "debtId": 1,
        "amount": 30,
        "description": "Water bottles",
        "partial": false
      },
      {
        "debtId": 2,
        "amount": 20,
        "description": "Delivery fee",
        "partial": true
      }
    ],
    "remainingDebt": 45
  }
}
```

## 🎨 **Frontend Integration**

### **Payment Form Updates:**

```javascript
// Remove payment limit restriction
// Allow any payment amount
const recordPayment = async (customerId, amount, method) => {
  const response = await fetch("/api/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customerId,
      amount, // No max limit needed
      paymentMethod: method,
    }),
  });

  const result = await response.json();

  // Show overpayment summary
  if (result.summary.creditAdded > 0) {
    showNotification(
      `Payment recorded! $${result.summary.creditAdded} added to credit balance.`
    );
  }

  return result;
};
```

### **Customer Display:**

```javascript
const CustomerCard = ({ customer }) => (
  <div className="customer-card">
    <h3>{customer.name}</h3>
    <p>{customer.phone}</p>

    {customer.balance.status === "CREDIT" ? (
      <div className="credit-balance">
        <span className="positive">
          Credit: +${customer.balance.creditBalance}
        </span>
      </div>
    ) : (
      <div className="debt-balance">
        <span className="negative">Owes: $${customer.balance.totalDebt}</span>
        {customer.balance.creditBalance > 0 && (
          <span className="credit">
            Credit: +${customer.balance.creditBalance}
          </span>
        )}
      </div>
    )}
  </div>
);
```

## 💡 **Frontend Implementation Examples:**

### **1. Customer Dashboard with Credit Balance:**

```javascript
const CustomerDashboard = ({ customer }) => (
  <div className="customer-card">
    <h3>{customer.name}</h3>

    {/* Credit Balance Display */}
    {customer.balance.creditBalance > 0 && (
      <div className="credit-section">
        <span className="credit-amount">
          Credit: +${customer.balance.creditBalance}
        </span>
        {customer.balance.totalDebt > 0 && (
          <button
            onClick={() => applyCreditToDebts(customer.id)}
            className="apply-credit-btn"
          >
            Apply Credit to Debts
          </button>
        )}
      </div>
    )}

    {/* Debt Display */}
    {customer.balance.totalDebt > 0 && (
      <div className="debt-section">
        <span className="debt-amount">Owes: ${customer.balance.totalDebt}</span>
      </div>
    )}

    {/* Net Balance */}
    <div className="net-balance">
      Net: {customer.balance.netBalance >= 0 ? "+" : ""}$
      {customer.balance.netBalance}
    </div>
  </div>
);

// Function to apply credit to debts
const applyCreditToDebts = async (customerId) => {
  try {
    const response = await fetch(`/api/payments/apply-credit/${customerId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (result.success) {
      showNotification(
        `Credit applied! $${result.summary.creditApplied} used to pay debts.`
      );
      refreshCustomerData();
    }
  } catch (error) {
    console.error("Error applying credit:", error);
  }
};
```

### **2. Payment Form (Overpayment Allowed):**

```javascript
const PaymentForm = ({ customer, onPaymentSuccess }) => {
  const [amount, setAmount] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/payments/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: customer.id,
          amount: parseFloat(amount),
          paymentMethod: "CASH",
        }),
      });

      const result = await response.json();

      if (result.success) {
        const { summary } = result;

        let message = `Payment of $${summary.totalPaid} recorded successfully!`;

        if (summary.creditAdded > 0) {
          message += ` $${summary.creditAdded} added to credit balance.`;
        }

        if (summary.appliedToDebt > 0) {
          message += ` $${summary.appliedToDebt} applied to debts.`;
        }

        showNotification(message);
        onPaymentSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <div className="payment-info">
        <p>Customer: {customer.name}</p>
        <p>Current Debt: ${customer.balance.totalDebt}</p>
        {customer.balance.creditBalance > 0 && (
          <p>Available Credit: ${customer.balance.creditBalance}</p>
        )}
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Payment amount (any amount allowed)"
        min="0"
        step="0.01"
        required
      />

      <button type="submit">Record Payment</button>

      <div className="payment-note">
        <small>
          💡 You can pay any amount. Overpayments will be added to credit
          balance.
        </small>
      </div>
    </form>
  );
};
```

### **3. Add Debt Form (Shows Auto Credit Application):**

```javascript
const AddDebtForm = ({ customer, onDebtAdded }) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const effectiveAmount = Math.max(
    0,
    parseFloat(amount || 0) - customer.balance.creditBalance
  );

  const creditToApply = Math.min(
    parseFloat(amount || 0),
    customer.balance.creditBalance
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: customer.id,
          amount: parseFloat(amount),
          description,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showNotification(result.message);
        onDebtAdded();
      }
    } catch (error) {
      console.error("Error adding debt:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Debt for {customer.name}</h3>

      {customer.balance.creditBalance > 0 && (
        <div className="credit-notice">
          <p>💳 Available Credit: ${customer.balance.creditBalance}</p>
        </div>
      )}

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Debt amount"
        min="0"
        step="0.01"
        required
      />

      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />

      {amount && customer.balance.creditBalance > 0 && (
        <div className="auto-credit-preview">
          <p>💡 Auto Credit Application:</p>
          <ul>
            <li>Debt Amount: ${amount}</li>
            <li>Credit Applied: ${creditToApply}</li>
            <li>Final Amount Owed: ${effectiveAmount}</li>
          </ul>
        </div>
      )}

      <button type="submit">Add Debt</button>
    </form>
  );
};
```

## 🚀 **New API Endpoints**

### **Get Customers with Balance:**

```
GET /api/customers/with-balance
```

### **Get Customer Balance Details:**

```
GET /api/customers/:id/balance
```

### **Record Payment (Enhanced):**

```
POST /api/payments
```

Now handles overpayments automatically.

## 🎯 **Benefits**

1. **Customer Satisfaction**: No payment restrictions
2. **Business Flexibility**: Handle any payment scenario
3. **Automatic Credit Management**: No manual tracking needed
4. **Clear Reporting**: See exactly how payments were applied
5. **Future-Proof**: Supports prepaid customers

## ⚡ **Next Steps**

1. **Update Frontend**: Remove payment amount restrictions
2. **Test Overpayments**: Try various payment scenarios
3. **Update Documentation**: Share with frontend team
4. **Monitor Usage**: Track how often overpayments occur

This system now handles the real-world scenario where customers pay more than they owe, making your shop management system more flexible and user-friendly! 🎉
