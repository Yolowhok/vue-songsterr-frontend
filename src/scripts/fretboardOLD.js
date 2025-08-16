import { getNotes } from "../api/notesAPI";
import { getOctaves } from "../api/notesAPI";

const standardTuning = ["E", "A", "D", "G", "B", "E"];

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function getNoteIndex(note) {
  return notes.indexOf(note);
}
const maxFrets = 24;
function createFretboard(tuning) {
  const fretboard = [];
  for (let stringIndex = 0; stringIndex < tuning.length; stringIndex++) {
    fretboard[stringIndex] = [];
    const openNote = tuning[stringIndex];
    let startIndex = getNoteIndex(openNote);
    if (startIndex === -1) {
      throw new Error(`Нота ${openNote} не найдена в списке нот`);
    }
    for (let fret = 0; fret <= maxFrets; fret++) {
      const noteIndex = (startIndex + fret) % notes.length;
      fretboard[stringIndex][fret] = notes[noteIndex];
    }
  }
  return fretboard;
}
const fretboard = createFretboard(standardTuning);
