import React, { useState } from "react";
import axiosInstance from "../../api/axios";
import axios from "axios";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await axiosInstance.post("/auth/signup", { name, email, password });
      alert("Sign up successful! Please log in.");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Sign up failed");
      } else {
        setError("Sign up failed");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md border dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-text-light dark:text-text-dark">
          Sign Up
        </h2>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-text-light dark:text-text-dark mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
          />
        </div>

        <div className="mb-4">
          <label className="block text-text-light dark:text-text-dark mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
          />
        </div>

        <div className="mb-6">
          <label className="block text-text-light dark:text-text-dark mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary-light dark:bg-primary-dark text-white py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
