export class Instrument {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
  }
  static create() {
    return new Instrument({
      id: 1,
      name: "GUITAR",
    });
  }
}
