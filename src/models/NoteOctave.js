import { Note } from "./Note";
import { Octave } from "./Octave";
export class NoteOctave {
  constructor(data) {
    this.id = data.id;
    this.note = data.note;
    this.octave = data.octave;
  }
}
