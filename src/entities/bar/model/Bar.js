import { TimeSignature } from "@/entities/catalog/model/TimeSignature.js";
import { Beat } from "@/entities/beat/model/Beat.js";

export class Bar {
  constructor(data) {
    (this.id = data.id),
      (this.tempInBpm = data.tempInBpm),
      (this.orderIndex = data.orderIndex),
      (this.timeSignature = data.timeSignature),
      (this.beats = (data.beats || []).map((beatsData) => new Beat(beatsData)));
  }
  static create(tempInBpm, orderIndex) {
    return new Bar({
      id: null,
      tempInBpm: tempInBpm,
      timeSignature: TimeSignature.Create(),
      orderIndex: orderIndex,
      beats: [Beat.create(1, 1)],
    });
  }
  static createDefault() {
    return new Bar({
      id: null,
      tempInBpm: 120,
      timeSignature: TimeSignature.Create(),
      orderIndex: 1,
      beats: [Beat.createDefault()],
    });
  }
}
