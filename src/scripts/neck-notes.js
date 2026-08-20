import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const fetchData = async (data) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/static/instruments`);
    response.data.forEach((element) => {
      data.push(new Instrument(element));
    });
  } catch (error) {
    console.error("Ошибка при fetching данных:", error);
  }
};
