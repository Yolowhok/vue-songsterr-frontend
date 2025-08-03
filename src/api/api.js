import axios from "axios";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL,
  baseURL: "https://school-server.ru.tuna.am",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json", // Явно запрашиваем JSON
  },
});

export default api;
