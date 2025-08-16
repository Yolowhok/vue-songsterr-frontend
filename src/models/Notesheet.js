import { Instrument } from "./Instrument";
import { Composition } from "./Composition";
import axios from "axios";
import { Bar } from "./Bar";
export class Notesheet {
  constructor(data) {
    this.id = data.id;
    this.instrument = new Instrument(data.instrument);
    this.bars = data.bars.map((barData) => {
      return new Bar(barData);
    });
  }

  static create() {
    return new Notesheet({
      id: null,
      instrument: Instrument.create(),
      bars: [],
    });
  }
  static create(instrument, tuning) {
    return new Notesheet({
      id: null,
      instrument: instrument,
      tuning: tuning,
      bars: [],
    });
  }
  static createDefault(tuning) {
    return new Notesheet({
      id: null,
      instrument: Instrument.createDefault(),
      tuning: tuning,
      bars: [Bar.createDefault()],
    });
  }
}
export const getNotesheetById = async (notesheet, id) => {
  try {
    const response = await axios.get(`http://localhost:8080/notesheet/${id}`);
    notesheet.value = new Notesheet(response.data);
  } catch (error) {
    console.error("Ошибка при fetching данных:", error);
  }
};
