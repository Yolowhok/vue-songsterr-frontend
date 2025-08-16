import { useMyStore } from "../store/notesheet-store";
import { newStore } from "../store/notesheet-store";

export function getFretboard() {
  const store = newStore();
  const notes = store.getNoteOctavesOrdered;
  const tuning =
    store.getComposition?.notesheets[store.getChosenNotesheet]?.tuning;
  const stringsMax = 6;
  const fretMax = 24;
  const tuningString = tuning.tuningStrings;
  const fretboard = [];

  tuningString.forEach((element) => {
    fretboard[element.stringNumber] = [];
    const index = notes.data.findIndex(
      (note) => note.id === element.noteOctave.id
    );
    for (let fret = 0; fret <= fretMax; fret++) {
      if (index + fret < notes.data.length) {
        const noteObj = notes.data[index + fret];
        fretboard[element.stringNumber][fret] = {
          noteOctave: {
            ...noteObj,
          },
          position: {
            id: (element.stringNumber - 1) * 24 + fret + element.stringNumber,
            fret: fret,
            string: element.stringNumber,
          },
        };
      }
    }
  });
  return fretboard;
}
