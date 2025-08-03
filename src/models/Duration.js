export class Duration {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.durationValue = data.durationValue;
  }
  static create() {
    return new Duration({
      id: 1,
      name: "WHOLE",
      durationValue: 1.0,
    });
  }
}
