/**
 * Build fretboard matrix from ordered note octaves and a tuning.
 * Pure helper — no Pinia imports (avoids cycle with composition store).
 */
export function getFretboard(notes, tuning) {
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
