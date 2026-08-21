import { BeatNote } from "./BeatNotes.js";
import { Duration } from "@/entities/catalog/model/Duration.js";

export class Beat {
  constructor(data) {
    this.id = data.id;
    this.duration = data.duration;
    this.orderIndex = data.orderIndex;
    this.dotted = Boolean(data.dotted);
    this.rest = Boolean(data.rest);
    this.tupletNum =
      data.tupletNum != null ? Number(data.tupletNum) : null;
    this.tupletDen =
      data.tupletDen != null ? Number(data.tupletDen) : null;
    this.beatNotes = (data.beatNotes || []).map(
      (beatNotesData) => new BeatNote(beatNotesData)
    );
  }
  static create(duration, orderIndex) {
    return new Beat({
      id: null,
      duration: Duration.create(),
      orderIndex: orderIndex,
      dotted: false,
      rest: false,
      tupletNum: null,
      tupletDen: null,
      beatNotes: [],
    });
  }
  static createDefault() {
    return new Beat({
      id: null,
      duration: Duration.create(),
      orderIndex: 1,
      dotted: false,
      rest: false,
      tupletNum: null,
      tupletDen: null,
      beatNotes: [],
    });
  }
}

/**
 * Effective fraction of a whole note for timeline / bar fill.
 * durationValue * (dotted ? 1.5 : 1) * (tupletDen/tupletNum if set)
 */
export function effectiveDurationValue(beat) {
  let v =
    beat?.duration?.durationValue != null
      ? Number(beat.duration.durationValue)
      : 0.25;
  if (beat?.dotted) v *= 1.5;
  const num = beat?.tupletNum;
  const den = beat?.tupletDen;
  if (num > 0 && den > 0) {
    v *= den / num;
  }
  return v;
}
