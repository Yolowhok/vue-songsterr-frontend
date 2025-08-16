export class TimeSignature {
  constructor(data) {
    this.id = data.id;
    this.upper = data.upper;
    this.lower = data.lower;
  }
  static Create() {
    return new TimeSignature({
      id: 3,
      upper: 4,
      lower: 4,
    });
  }
}
