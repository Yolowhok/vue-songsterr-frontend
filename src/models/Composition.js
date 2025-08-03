import { Notesheet } from "./Notesheet";
import axios from "axios";

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
}

export const getCompositionsById = async (compositions, id) => {
  try {
    const response = await axios.get(`http://localhost:8080/composition/${id}`);
    compositions.value = new Composition(response.data);
  } catch (error) {
    console.error("Ошибка при fetching данных:", error);
  }
};
export const getCompositionsByIdFull = async (compositions, id) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/composition/${id}/full`
    );
    compositions.value = new Composition(response.data);
  } catch (error) {
    console.error("Ошибка при fetching данных:", error);
  }
};

export const getCompositions = async (compositions) => {
  try {
    const response = await axios.get(`http://localhost:8080/compositions`);
    compositions.value = response.data.map(
      (compositionData) => new Composition(compositionData)
    );
  } catch (error) {
    console.error("Ошбика при fetching данных:", error);
  }
};
