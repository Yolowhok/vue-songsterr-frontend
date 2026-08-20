import { Notesheet } from "@/entities/notesheet/model/Notesheet.js";

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
