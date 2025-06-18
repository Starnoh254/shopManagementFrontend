import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import SignUp from "./components/auth/SignUp";
import Login from "./components/auth/Login";
import AllDebtsList from "./components/customer/AllDebtsList";
import Dashboard from "./components/dashboard/Dashboard";
import NewDebt from "./components/customer/NewDebt";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<AllDebtsList />} /> {/* /dashboard */}
          <Route path="new-debt" element={<NewDebt />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
