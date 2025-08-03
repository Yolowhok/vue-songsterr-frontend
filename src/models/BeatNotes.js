import { NoteOctave } from "./NoteOctave";
import { Position } from "./Position";
export class BeatNote {
  constructor(data) {
    (this.id = data.id),
      (this.noteOctave = new NoteOctave(data.noteOctave)),
      (this.position = new Position(data.position));
  }
  static create(noteOctave, position) {
    return new BeatNote({
      id: null,
      noteOctave: noteOctave,
      position: Position.create(position),
    });
  }
}
