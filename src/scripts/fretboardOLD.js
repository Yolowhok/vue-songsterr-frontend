import { getNotes } from "../api/notesAPI";
import { getOctaves } from "../api/notesAPI";

// Например, стандартный строй 6-струнной гитары: (строки нумеруются с 1 - самая толстая)
const standardTuning = ["E", "A", "D", "G", "B", "E"];

// Все возможные ноты в хроматической гамме (около 12 нот)
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Функция для получения индекса ноты в массиве notes
function getNoteIndex(note) {
  return notes.indexOf(note);
}

// Максимальное количество ладов (например, 24)
const maxFrets = 24;

// Создаем массив, где для каждой струны и лада будет своя нота
// Результат: array[string][fret] = 'нота'
function createFretboard(tuning) {
  const fretboard = [];
  for (let stringIndex = 0; stringIndex < tuning.length; stringIndex++) {
    fretboard[stringIndex] = [];
    const openNote = tuning[stringIndex]; // открытая струна
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

console.log(fretboard);
/*
Вывод:
[
  ['E', 'F', 'F#', ..., 'D#'], // 6-я струна
  ['A', 'A#', 'B', ..., 'G#'], // 5-я струна
  ...
  ['E', 'F', 'F#', ..., 'D#']  // 1-я струна
]
*/
