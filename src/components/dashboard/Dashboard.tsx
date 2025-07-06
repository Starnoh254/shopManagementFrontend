import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Function to handle navigation link clicks
  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <span className="text-xl font-bold text-primary-light dark:text-primary-dark">
            Dashboard
          </span>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark transition-colors"
            onClick={handleLinkClick}
          >
            <span className="mr-3">🏠</span>
            Dashboard Home
          </Link>
          <Link
            to="sales"
            className="flex items-center px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark transition-colors"
            onClick={handleLinkClick}
          >
            <span className="mr-3">💰</span>
            Sales Management
          </Link>
          <Link
            to="products"
            className="flex items-center px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark transition-colors"
            onClick={handleLinkClick}
          >
            <span className="mr-3">📦</span>
            Products
          </Link>
          <Link
            to="services"
            className="flex items-center px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark transition-colors"
            onClick={handleLinkClick}
          >
            <span className="mr-3">🔧</span>
            Services
          </Link>
          <Link
            to="customers"
            className="flex items-center px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark transition-colors"
            onClick={handleLinkClick}
          >
            <span className="mr-3">👥</span>
            Customers
          </Link>
          <Link
            to="debts"
            className="flex items-center px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark transition-colors"
            onClick={handleLinkClick}
          >
            <span className="mr-3">💸</span>
            Debts
          </Link>
          <Link
            to="payments"
            className="flex items-center px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark transition-colors"
            onClick={handleLinkClick}
          >
            <span className="mr-3">💳</span>
            Payments
          </Link>
          <Link
            to="reports"
            className="flex items-center px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark transition-colors"
            onClick={handleLinkClick}
          >
            <span className="mr-3">📊</span>
            Reports
          </Link>

          {/* Quick Actions Section */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Quick Actions
            </h3>
            <Link
              to="sales"
              className="flex items-center px-4 py-2 rounded hover:bg-green-600 hover:text-white transition-colors text-green-600 dark:text-green-400"
              onClick={handleLinkClick}
            >
              <span className="mr-3">🛒</span>
              New Sale
            </Link>
            <Link
              to="products"
              className="flex items-center px-4 py-2 rounded hover:bg-blue-600 hover:text-white transition-colors text-blue-600 dark:text-blue-400"
              onClick={handleLinkClick}
            >
              <span className="mr-3">📦</span>
              Add Product
            </Link>
            <Link
              to="services"
              className="flex items-center px-4 py-2 rounded hover:bg-indigo-600 hover:text-white transition-colors text-indigo-600 dark:text-indigo-400"
              onClick={handleLinkClick}
            >
              <span className="mr-3">🔧</span>
              Add Service
            </Link>
            <Link
              to="customers?action=create"
              className="flex items-center px-4 py-2 rounded hover:bg-purple-600 hover:text-white transition-colors text-purple-600 dark:text-purple-400"
              onClick={handleLinkClick}
            >
              <span className="mr-3">➕</span>
              Add Customer
            </Link>
            <Link
              to="debts?action=create"
              className="flex items-center px-4 py-2 rounded hover:bg-orange-600 hover:text-white transition-colors text-orange-600 dark:text-orange-400"
              onClick={handleLinkClick}
            >
              <span className="mr-3">💸</span>
              Record Debt
            </Link>
            <Link
              to="payments?action=create"
              className="flex items-center px-4 py-2 rounded hover:bg-teal-600 hover:text-white transition-colors text-teal-600 dark:text-teal-400"
              onClick={handleLinkClick}
            >
              <span className="mr-3">💵</span>
              Record Payment
            </Link>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-full md:min-w-0">
        {/* Top bar for mobile */}
        <div className="md:hidden flex items-center p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
          <button onClick={() => setSidebarOpen(true)} className="mr-4">
            ☰
          </button>
          <span className="text-lg font-bold text-primary-light dark:text-primary-dark">
            Dashboard
          </span>
        </div>
        <main className="flex-1 p-6">
          <Outlet /> {/* This renders the matched child route */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
