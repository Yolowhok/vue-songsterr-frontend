import { Note } from "./Note";
import { Octave } from "./Octave";
export class Position {
  constructor(data) {
    this.id = data.id;
    this.string = data.string;
    this.fret = data.fret;
  }
  static create(position) {
    return new Position({
      id: null,
      string: position.string,
      fret: position.fret,
    });
  }
}
