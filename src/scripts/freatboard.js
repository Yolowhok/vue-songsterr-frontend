import { getNoteOctavesOrdered } from "../api/notesAPI";
import { useMyStore } from "../store/notesheet-store";
export function getFretboard() {
  const store = useMyStore();
  const notes = store.noteOctaveOrdered;

  const tuning = store.notesheets?.notesheets[store.notesheetChoise]?.tuning;

  const stringsMax = 6;
  const fretMax = 24;
  const tuningString = tuning.tuningStrings;
  // console.log("tuning string", tuningString);

  const fretboard = [];

  tuningString.forEach((element) => {
    fretboard[element.stringNumber] = [];
    // console.log(element.noteOctave.id);
    const index = notes.data.findIndex(
      (note) => note.id === element.noteOctave.id
    );
    for (let fret = 0; fret <= fretMax; fret++) {
      if (index + fret < notes.data.length) {
        const noteObj = notes.data[index + fret];
        // Используем оператор расширения для создания нового объекта
        fretboard[element.stringNumber][fret] = {
          noteOctave: {
            ...noteObj, // Копируем свойства объекта noteObj
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

  // console.log("NEW FRETBOARD", fretboard);
  return fretboard;
}
