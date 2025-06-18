import axios from "axios";

const instance = axios.create({
  // For Vite projects, use import.meta.env; for CRA, install @types/node or declare process
  baseURL: import.meta.env.VITE_API_BASE_URL, // now uses .env variable
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
