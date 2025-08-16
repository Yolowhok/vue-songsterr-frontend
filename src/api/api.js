import axios from "axios";

const api = axios.create({
  baseURL: "https://school-server.ru.tuna.am",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
