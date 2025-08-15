import { BeatNote } from "./BeatNotes";
import { Duration } from "./Duration";
export class Beat {
  constructor(data) {
    (this.id = data.id),
      (this.duration = data.duration),
      (this.orderIndex = data.orderIndex),
      (this.beatNotes = data.beatNotes.map(
        (beatNotesData) => new BeatNote(beatNotesData)
      ));
  }
  static create(duration, orderIndex) {
    return new Beat({
      id: null,
      duration: Duration.create(),
      orderIndex: orderIndex,
      beatNotes: [],
    });
  }
  static createDefault() {
    return new Beat({
      id: null,
      duration: Duration.create(),
      orderIndex: 1,
      beatNotes: [],
    });
  }
}
