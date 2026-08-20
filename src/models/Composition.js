import { Notesheet } from "./Notesheet";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export class Composition {
  constructor(data) {
    (this.id = data.id),
      (this.band = data.band),
      (this.title = data.title),
      (this.createdAt = data.createdAt),
      (this.updatedAt = data.updatedAt),
      (this.notesheets = Array.isArray(data.notesheets)
        ? data.notesheets.map((dataNotesheet) => new Notesheet(dataNotesheet))
        : []);
  }
  static create(band, title) {
    return new Composition({
      id: null,
      band: band,
      title: title,
      createdAt: null,
      updatedAt: null,
      notesheets: [],
    });
  }
  static createDefault(data, tuning) {
    return new Composition({
      id: null,
      band: data.band,
      title: data.title,
      createdAt: null,
      updatedAt: null,
      notesheets: [Notesheet.createDefault(tuning)],
    });
  }
}

export const getCompositionsById = async (compositions, id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/composition/${id}`);
    compositions.value = new Composition(response.data);
  } catch (error) {
    console.error("Ошибка при fetching данных:", error);
  }
};
export const getCompositionsByIdFull = async (compositions, id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/composition/${id}/full`);
    compositions.value = new Composition(response.data);
  } catch (error) {
    console.error("Ошибка при fetching данных:", error);
  }
};

export const getCompositions = async (compositions) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/compositions`);
    compositions.value = response.data.map(
      (compositionData) => new Composition(compositionData)
    );
  } catch (error) {
    console.error("Ошбика при fetching данных:", error);
  }
};
