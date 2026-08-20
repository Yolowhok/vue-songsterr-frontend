export class Duration {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.durationValue = data.durationValue;
  }
  static create() {
    return new Duration({ durationValue: 0.25, id: 4, name: "QUARTER" });
  }
}
