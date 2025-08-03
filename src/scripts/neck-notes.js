import axios from "axios";

export const fetchData = async (data) => {
  try {
    const response = await axios.get(
      "http://localhost:8080/static/instruments"
    );
    response.data.forEach((element) => {
      data.push(new Instrument(element));
    });
  } catch (error) {
    console.error("Ошибка при fetching данных:", error);
  }
};
