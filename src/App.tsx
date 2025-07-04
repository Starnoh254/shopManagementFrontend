import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SignUp from "./components/auth/SignUp";
import Login from "./components/auth/Login";
import Dashboard from "./components/dashboard/Dashboard";
import DashboardHome from "./components/dashboard/DashboardHome";
import CustomerList from "./components/customers/CustomerList";
import AllDebtsList from "./components/customer/AllDebtsList";
import PaymentsList from "./components/payments/PaymentsList";
import Reports from "./components/reports/Reports";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />{" "}
          {/* /dashboard - shows overview */}
          <Route path="customers" element={<CustomerList />} />{" "}
          {/* /dashboard/customers */}
          <Route path="debts" element={<AllDebtsList />} />{" "}
          {/* /dashboard/debts */}
          <Route path="payments" element={<PaymentsList />} />{" "}
          {/* /dashboard/payments */}
          <Route path="reports" element={<Reports />} />{" "}
          {/* /dashboard/reports */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
