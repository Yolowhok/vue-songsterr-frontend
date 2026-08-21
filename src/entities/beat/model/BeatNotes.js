import { NoteOctave } from "@/entities/catalog/model/NoteOctave.js";
import { Position } from "@/entities/catalog/model/Position.js";

/** @typedef {'hammer'|'pull'|'slide_up'|'slide_down'|'bend'} NoteTechnique */

export class BeatNote {
  constructor(data) {
    this.id = data.id;
    this.noteOctave = new NoteOctave(data.noteOctave);
    this.position = new Position(data.position);
    this.tied = Boolean(data.tied);
    this.technique = data.technique || null;
    this.bendValue = data.bendValue || null;
  }
  static create(noteOctave, position) {
    return new BeatNote({
      id: null,
      noteOctave: noteOctave,
      position: Position.create(position),
      tied: false,
      technique: null,
      bendValue: null,
    });
  }
}
