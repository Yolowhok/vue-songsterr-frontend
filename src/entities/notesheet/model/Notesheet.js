import { Instrument } from "@/entities/catalog/model/Instrument.js";
import { Bar } from "@/entities/bar/model/Bar.js";

export class Notesheet {
  constructor(data) {
    this.id = data.id;
    this.instrument = new Instrument(data.instrument);
    this.bars = (data.bars || []).map((barData) => {
      return new Bar(barData);
    });
    this.tuning = data.tuning;
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
