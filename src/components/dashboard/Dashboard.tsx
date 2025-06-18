import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            className="block px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark"
          >
            Home
          </Link>
          <Link
            to="new-debt"
            className="block px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark"
          >
            Add Debt
          </Link>
          {/* <Link
            to="debts"
            className="block px-4 py-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark"
          >
            Debts
          </Link> */}
          {/* Add more links as needed */}
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
