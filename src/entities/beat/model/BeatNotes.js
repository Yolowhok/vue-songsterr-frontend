import { NoteOctave } from "@/entities/catalog/model/NoteOctave.js";
import { Position } from "@/entities/catalog/model/Position.js";

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
