// stores/myStore.js
import { defineStore } from "pinia";
import { getCompositions, saveComposition } from "../api/compositionAPI";
import { getCompositionByIdFull } from "../api/compositionAPI";
import { getCompositionNotesheetsListById } from "../api/compositionAPI";
import { Bar } from "../models/Bar";
import { getFretboard } from "../scripts/freatboard";
import { getNoteOctavesOrdered } from "../api/notesAPI";
import { Beat } from "../models/Beat";
import { getDurations } from "../api/durationAPI";
import { getTimeSignatures } from "../api/timeSignatureAPI";
import { saveNotesheet } from "../api/notesheetAPI";
// import Notesheet from "../components/notesheet/Notesheet.vue";
// import { Instrument } from "../models/Instrument";
import { getInstruments } from "../api/instrumentAPI";
import { getTunings } from "../api/tuningAPI";
import { toRaw } from "vue";

export const newStore = defineStore("newStore", {
  state: () => ({
    compositionList: [],
    composition: [],
    chosenNotesheet: 0,
    chosenComposition: {},
    fretboard: [],
    noteOctaveOrdered: [],
    durations: [],
    points: [],
    isLoading: false,
    settings: {
      orientation: "nowrap",
    },
  }),

  getters: {
    getCompositionList: (state) => state.compositionList,
    getComposition: (state) => state.composition,
    getChosenNotesheet: (state) => state.chosenNotesheet,
    getChosenComposition: (state) => state.chosenComposition,
    getCompositionById: (state) => {
      return (id) => {
        // Ищем в compositionList
        const fromList = state.compositionList.find((comp) => comp.id == id);
        if (fromList) return fromList;

        // Если не нашли, проверяем текущую composition
        if (state.composition.id == id) {
          return state.composition;
        }
        // Если не нашли нигде
        return null;
      };
    },
    getOrientation: (state) => {
      return state.settings.orientation;
    },
    getNoteOctavesOrdered: (state) => state.noteOctaveOrdered,
    getFretboard: (state) => state.fretboard,
    getDuration: (state) => state.durations,
    getPoints: (state) => state.points,
    isCompositionListEmpty: (state) => {
      return (
        Array.isArray(state.compositionList) &&
        state.compositionList.length === 0
      );
    },
    isCompositionEmpty: (state) => {
      return Array.isArray(state.composition) && state.composition.length === 0;
    },
    isLoadingProcess: (state) => state.isLoading,
  },

  actions: {
    async fetchCompositionList() {
      try {
        const response = await getCompositions();
        this.compositionList = response.data; // устанавливаем в state
        console.log("Composition list is load");
      } catch (e) {
        console.error("Ошибка при загрузке композиций", e);
      }
    },
    async fetchComposition(id) {
      try {
        const response = await getCompositionByIdFull(id);
        this.composition = response.data; // устанавливаем в state
        console.log("Composition is load");
      } catch (e) {
        console.error("Ошибка при загрузке notesheets", e);
      }
    },
    async fetchNoteOctaveOrdered() {
      try {
        const response = await getNoteOctavesOrdered();
        this.noteOctaveOrdered = response;
        console.log("NoteOctaveOrdered is load");
      } catch (e) {}
    },
    async fetchDuration() {
      this.durations = null;
      this.durations = await getDurations();
      console.log("Duration is load");
    },
    setFretboard() {
      this.fretboard = null;
      const fretboardData = getFretboard();
      this.fretboard = fretboardData;
    },
    toggleOrientation() {
      this.settings.orientation =
        this.settings.orientation === "wrap" ? "nowrap" : "wrap";
      console.log("Orientation changed to:", this.settings.orientation);
    },
    setChosenNotesheet(index) {
      try {
        const num = Number.parseInt(index);
        if (num >= 0 && num < this.composition.notesheets.length) {
          this.chosenNotesheet = num;
        } else {
          console.warn("Invalid notesheet index:", num);
        }
      } catch (e) {
        console.log("Type error");
      }
    },
    setChosenComposition(composition) {
      console.log(composition);
      this.chosenComposition = composition;
    },
    deleteNote(barOrderIndex, beatOrderIndex, noteValue) {
      const currentNoteSheet =
        this.getComposition?.notesheets[this.chosenNotesheet];

      console.log(currentNoteSheet);
      // const currentNoteSheet = this.notesheets.notesheets[this.notesheetChoise];
      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      // Найти нужный bar по barId
      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }

      // Найти нужный beat внутри bar
      const beat = bar.beats.find((beat) => beat.orderIndex === beatOrderIndex);
      if (!beat) {
        console.warn("Beat not found");
        return;
      }
      const beatNote = beat.beatNotes.find(
        (beatNote) => beatNote.position.string === noteValue.position.string
      );
      const index = beat.beatNotes.findIndex(
        (beatNote) => beatNote.position.string === noteValue.position.string
      );

      if (index !== -1) {
        beat.beatNotes.splice(index, 1);
        console.log("Deleted beatNote", beatNote);
      } else {
        console.warn("beatNote не найден");
      }
    },
    updateNoteValue(barOrderIndex, beatOrderIndex, newValue) {
      const currentNoteSheet =
        this.getComposition?.notesheets[this.chosenNotesheet];

      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      // Найти нужный bar по barId
      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }

      // Найти нужный beat внутри bar
      const beat = bar.beats.find((beat) => beat.orderIndex === beatOrderIndex);
      if (!beat) {
        console.warn("Beat not found");
        return;
      }

      const beatsNote = beat.beatNotes.find(
        (beatNote) => beatNote.position.string === newValue.position.string
      );

      beatsNote.noteOctave = newValue.noteOctave;
      beatsNote.position = newValue.position;
    },
    addNote(barOrderIndex, beatOrderIndex, newValue) {
      const currentNoteSheet =
        this.getComposition?.notesheets[this.chosenNotesheet];

      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }

      const beat = bar.beats.find((beat) => beat.orderIndex === beatOrderIndex);
      if (!beat) {
        console.warn("Beat not found");
        return;
      }

      beat.beatNotes.push(newValue);
    },
    checkAllDurations(beats, timeSignature) {
      if (!beats) {
        console.warn("Notesheet not found");
      }
      const quartDuration = 0.25;

      const beatsPoints = [];

      beats.forEach((beat, index) => {
        beatsPoints.push({ x1: 55, x2: 90 });
        let currentBeat = beat;
        let nextBeat = beats[index + 1];
        let prevBeat = beats[index - 1];

        if (
          (currentBeat?.duration?.durationValue ==
            prevBeat?.duration?.durationValue ||
            currentBeat?.duration?.durationValue ==
              prevBeat?.duration?.durationValue) &&
          prevBeat?.duration?.durationValue != 0.25
        ) {
          beatsPoints[index].x1 = -100;
        }
        if (
          (currentBeat?.duration?.durationValue ==
            nextBeat?.duration?.durationValue ||
            currentBeat?.duration?.durationValue ==
              nextBeat?.duration?.durationValue) &&
          nextBeat?.duration?.durationValue != 0.25
        ) {
          beatsPoints[index].x2 = 250;
        }
        if (
          !nextBeat &&
          prevBeat?.duration?.durationValue ==
            currentBeat?.duration?.durationValue
        ) {
          beatsPoints[index].x2 = 55;
        }
        if (
          nextBeat?.duration?.durationValue !=
            currentBeat?.duration?.durationValue &&
          currentBeat?.duration?.durationValue ==
            prevBeat?.duration?.durationValue
        ) {
          beatsPoints[index].x2 = 55;
        }

        // if (
        //   currentBeat?.duration?.durationValue <=
        //     prevBeat?.duration?.durationValue &&
        //   prevBeat?.duration?.durationValue != 0.25
        // ) {
        //   beatsPoints[index].x1 = -100;
        // }
        // if (
        //   currentBeat?.duration?.durationValue <=
        //     nextBeat?.duration?.durationValue &&
        //   nextBeat?.duration?.durationValue != 0.25
        // ) {
        //   beatsPoints[index].x2 = 250;
        // }
        // if (
        //   !nextBeat &&
        //   prevBeat?.duration?.durationValue ==
        //     currentBeat?.duration?.durationValue
        // ) {
        //   beatsPoints[index].x2 = 55;
        // }
      });
      this.points = beatsPoints;
      return beatsPoints;
    },
    checkDurations(barOrderIndex, beatOrderIndex, name) {
      const currentNoteSheet =
        this.getComposition?.notesheets[this.chosenNotesheet];
      console.log("CHANGE DURATION WIDTH", barOrderIndex, beatOrderIndex, name);

      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      // Найти нужный bar по barOrderIndex
      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }

      // Найти индекс текущего бита в массиве битов бара
      const beats = bar.beats;

      // Найти текущий beat по beatOrderIndex (параметру функции)
      const currentBeat = beats.find(
        (beat) => beat.orderIndex === beatOrderIndex
      );
      if (!currentBeat) {
        console.warn(
          "Current beat not found",
          barOrderIndex,
          beatOrderIndex,
          name
        );
        return;
      }

      let x1 = 55;
      let x2 = 90;

      // Найти следующий beat с orderIndex + 1
      const nextBeat = beats.find(
        (beat) => beat.orderIndex === beatOrderIndex + 1
      );
      const prevBeat = beats.find(
        (beat) => beat.orderIndex === beatOrderIndex - 1
      );

      if (nextBeat && nextBeat.duration?.name == name) {
        x2 = 250;
      } else if (prevBeat && prevBeat.duration?.name == name) {
        x2 = 55;
      }
      if (nextBeat == undefined) {
        x2 = 90;
      }
      // Найти предыдущий beat с orderIndex - 1

      if (prevBeat == undefined) {
      }
      if (prevBeat && prevBeat.duration?.name == name) {
        x1 = -100;
        if (nextBeat == undefined) {
          x2 = 55;
        }
      }

      return { x1, x2 };
    },
    setDurationForBeat(barOrderIndex, beatOrderIndex, value) {
      this.durations.data.forEach((duration) => {
        const finalDuration = this.durations.data.find((d) => d.name === value);
        const currentNoteSheet =
          this.getComposition?.notesheets[this.chosenNotesheet];

        if (!currentNoteSheet) {
          console.warn("Notesheet not found");
          return;
        }

        // Найти нужный bar по barId
        const bar = currentNoteSheet.bars.find(
          (bar) => bar.orderIndex === barOrderIndex
        );
        if (!bar) {
          console.warn("Bar not found");
          return;
        }

        // Найти нужный beat внутри bar
        const beat = bar.beats.find(
          (beat) => beat.orderIndex === beatOrderIndex
        );
        if (!beat) {
          console.warn("Beat not found");
          return;
        }
        beat.duration = finalDuration;
        // console.log(beat, finalDuration);
        // console.log(barOrderIndex, beatOrderIndex, value);
      });
    },
    deleteBeat(barOrderIndex, beatOrderIndex) {
      try {
        const currentNoteSheet =
          this.getComposition?.notesheets[this.chosenNotesheet];

        if (!currentNoteSheet) {
          console.warn("Notesheet not found");
          return;
        }

        // Найти нужный bar по barOrderIndex
        const bar = currentNoteSheet.bars.find(
          (bar) => bar.orderIndex === barOrderIndex
        );
        if (!bar) {
          console.warn("Bar not found");
          return;
        }

        // Найти индекс beat в массиве beats
        const beatIndex = bar.beats.findIndex(
          (beat) => beat.orderIndex === beatOrderIndex
        );
        if (beatIndex === -1) {
          console.warn("Beat not found");
          return;
        }

        // Удаляем beat из массива
        bar.beats.splice(beatIndex, 1);

        // Смещаем orderIndex у последующих beat
        for (let i = beatIndex; i < bar.beats.length; i++) {
          bar.beats[i].orderIndex = bar.beats[i].orderIndex - 1;
        }
      } catch (error) {
        console.log("error delete beat: ", error);
      } finally {
        console.log("deleteBeat done");
      }
    },
  },
});

export const useMyStore = defineStore("notesheet-store", {
  state: () => ({
    store: [],
    compositions: [],
    notesheets: [],
    notesheetsList: [],
    fretboard: [],
    notesheetChoise: 0,
    noteOctaveOrdered: [],
    duration: [],
    timeSignature: [],
    instruments: [],
    tunings: [],
  }),
  actions: {
    async fetchCompositions() {
      try {
        const response = await getCompositions();
        this.noteOctaveOrdered = await getNoteOctavesOrdered();

        this.compositions = response.data; // устанавливаем в state
      } catch (e) {
        console.error("Ошибка при загрузке композиций", e);
      }
    },
    async fetchCompositionNotesheet(id) {
      try {
        const response = await getCompositionByIdFull(id);
        this.notesheets = response.data; // устанавливаем в state
      } catch (e) {
        console.error("Ошибка при загрузке notesheets", e);
      }
    },
    async fetchCompositionNotesheetsList(id) {
      try {
        const response = await getCompositionNotesheetsListById(id);
        this.notesheetsList = response.data; // устанавливаем в state
        console.log("dsdsssddssds");
      } catch (e) {
        console.error("Ошибка при загрузке notesheets", e);
      }
    },
    fetchAddBarRigth(notesheetIndex, barIndex) {
      try {
        const notesheet = this.notesheets.notesheets[this.notesheetChoise];

        if (notesheet && Array.isArray(notesheet.bars)) {
          // Сортируем бары по orderIndex
          notesheet.bars.sort((a, b) => a.orderIndex - b.orderIndex);

          // Сдвигаем orderIndex для всех баров справа от barIndex
          for (let i = barIndex; i < notesheet.bars.length; i++) {
            notesheet.bars[i].orderIndex += 1;
          }

          // Создаём новый бар с orderIndex = orderIndex бара на barIndex + 1
          const newBar = Bar.create(120, barIndex + 1);
          console.log(newBar);
          // Вставляем новый бар после barIndex
          // notesheet.bars.splice(barIndex + 1, 0, newBar);
          notesheet.bars.push(newBar);

          notesheet.bars.sort((a, b) => a.orderIndex - b.orderIndex);
        } else {
          console.warn(
            "Невозможно добавить бар: данные отсутствуют или некорректны"
          );
        }
      } catch (error) {
        console.error("Ошибка при добавлении бара справа:", error);
      }
      // try {
      //   const notesheet = this.notesheets.notesheets?.[notesheetIndex];
      //   console.log("notesheetIndex ", notesheetIndex, " barIndex ", barIndex);
      //   if (notesheet && Array.isArray(notesheet.bars)) {
      //     // Сортируем бары по orderIndex
      //     notesheet.bars.sort((a, b) => a.orderIndex - b.orderIndex);

      //     // Сдвигаем orderIndex для всех баров справа от barIndex
      //     for (let i = barIndex; i < notesheet.bars.length; i++) {
      //       notesheet.bars[i].orderIndex += 1;
      //     }

      //     // Создаём новый бар с orderIndex = orderIndex бара на barIndex + 1
      //     const newBar = Bar.create(120, 1, barIndex + 1);

      //     // Вставляем новый бар после barIndex
      //     // notesheet.bars.splice(barIndex + 1, 0, newBar);
      //     notesheet.bars.push(newBar);

      //     notesheet.bars.sort((a, b) => a.orderIndex - b.orderIndex);

      //     console.log("Бар успешно добавлен справа от индекса", barIndex);
      //     console.log(notesheet.bars);
      //   } else {
      //     console.warn(
      //       "Невозможно добавить бар: данные отсутствуют или некорректны"
      //     );
      //   }
      // } catch (error) {
      //   console.error("Ошибка при добавлении бара справа:", error);
      // }
    },
    fetchCreateNotesheet(instrument, tuning) {
      let newInstrument = JSON.parse(JSON.stringify(instrument.value));
      let newTuning = JSON.parse(JSON.stringify(tuning.value));

      try {
        this.notesheets.notesheets.push({
          instrument: newInstrument,
          tuning: newTuning,
          bars: [],
        });
        console.log(toRaw(this.notesheets));
        saveComposition(toRaw(this.notesheets));
      } catch (error) {
        console.error("Ошибка при добавлении бара справа:", error);
      }
    },

    fetchAddBarRigthInEmpty() {
      try {
        const notesheet = this.notesheets.notesheets[this.notesheetChoise];

        if (notesheet && Array.isArray(notesheet.bars)) {
          // Сортируем бары по orderIndex

          // Сдвигаем orderIndex для всех баров справа от barIndex

          // Создаём новый бар с orderIndex = orderIndex бара на barIndex + 1
          const newBar = Bar.create(120, 1);
          console.log(newBar);
          // Вставляем новый бар после barIndex
          // notesheet.bars.splice(barIndex + 1, 0, newBar);
          notesheet.bars.push(newBar);
        } else {
          console.warn(
            "Невозможно добавить бар: данные отсутствуют или некорректны"
          );
        }
      } catch (error) {
        console.error("Ошибка при добавлении бара справа:", error);
      }
    },
    fetchAddBarLeft() {},

    fetchDeleteBar(notesheetIndex, orderIndexToDelete) {
      try {
        const notesheet = this.notesheets.notesheets?.[notesheetIndex];
        if (notesheet?.bars) {
          const barIndex = notesheet.bars.findIndex(
            (bar) => bar.orderIndex === orderIndexToDelete
          );
          if (barIndex !== -1) {
            notesheet.bars.splice(barIndex, 1);
            console.log(
              "Бар с orderIndex",
              orderIndexToDelete,
              "успешно удалён"
            );
            console.log(notesheet.bars);
          } else {
            console.warn("Бар с orderIndex", orderIndexToDelete, "не найден");
          }
        }
      } catch (error) {
        console.error("Ошибка при удалении бара:", error);
      }
    },
    addBeat(barOrderIndex, beatOrderIndex) {
      // console.log(barOrderIndex, beatOrderIndex);
      try {
        const notesheet = this.notesheets.notesheets[this.notesheetChoise];
        if (notesheet && Array.isArray(notesheet.bars)) {
          const bar = notesheet.bars.find(
            (b) => b.orderIndex === barOrderIndex
          );
          if (!bar) {
            console.warn("Бар не найден с указанным orderIndex");
            return;
          }

          if (!Array.isArray(bar.beats)) {
            bar.beats = [];
          }

          if (beatOrderIndex === -1) {
            // Смещаем всех битов с orderIndex >= 1 вправо (+1)
            bar.beats.forEach((beat) => {
              if (beat.orderIndex >= 1) {
                beat.orderIndex += 1;
              }
            });
            beatOrderIndex = 1; // новый бит будет с orderIndex = 1
          }

          const newBeat = Beat.create(
            { durationValue: 0.25, id: 4, name: "QUARTER" },
            beatOrderIndex
          );

          bar.beats.push(newBeat);

          bar.beats.sort((a, b) => a.orderIndex - b.orderIndex);

          console.log("Обновлённый список битов:", bar.beats);
          console.log(bar);
        } else {
          console.warn(
            "Невозможно добавить бара: данные отсутствуют или некорректны"
          );
        }
      } catch (error) {
        console.error("Ошибка при добавлении бара справа:", error);
      }
    },
    deleteBeat(barOrderIndex, beatOrderIndex) {
      const currentNoteSheet = this.notesheets.notesheets[this.notesheetChoise];
      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      // Найти нужный bar по barOrderIndex
      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }

      // Найти индекс beat в массиве beats
      const beatIndex = bar.beats.findIndex(
        (beat) => beat.orderIndex === beatOrderIndex
      );
      if (beatIndex === -1) {
        console.warn("Beat not found");
        return;
      }

      // Удаляем beat из массива
      bar.beats.splice(beatIndex, 1);

      // Смещаем orderIndex у последующих beat
      for (let i = beatIndex; i < bar.beats.length; i++) {
        bar.beats[i].orderIndex = bar.beats[i].orderIndex - 1;
      }
      console.log(bar);
    },
    async fetchSetFretboard() {},
    async fetchSetNotesheetChoise(id) {
      this.notesheetChoise = id;
    },
    async fetchGetIndexOfNotesheetChoise() {
      for (let i = 0; i < store.notesheets.length; i++) {
        if (this.notesheetChoise == store.notesheets[i].id) {
          return i;
        }
      }
    },
    fetchAddNote(barOrderIndex, beatOrderIndex, newValue) {
      const currentNoteSheet = this.notesheets.notesheets[this.notesheetChoise];
      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      // Найти нужный bar по barId
      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }

      // Найти нужный beat внутри bar
      const beat = bar.beats.find((beat) => beat.orderIndex === beatOrderIndex);
      if (!beat) {
        console.warn("Beat not found");
        return;
      }
      // Проверяем, есть ли массив beatNotes, если нет - создаём
      // if (!beat.beatNotes) {
      //   beat.beatNotes = [];
      // }

      // Добавляем объект в массив
      beat.beatNotes.push(newValue);
    },
    updateNoteValue(barOrderIndex, beatOrderIndex, newValue) {
      const currentNoteSheet = this.notesheets.notesheets[this.notesheetChoise];
      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      // Найти нужный bar по barId
      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }

      // Найти нужный beat внутри bar
      const beat = bar.beats.find((beat) => beat.orderIndex === beatOrderIndex);
      if (!beat) {
        console.warn("Beat not found");
        return;
      }

      const beatsNote = beat.beatNotes.find(
        (beatNote) => beatNote.position.string === newValue.position.string
      );

      beatsNote.noteOctave = newValue.noteOctave;
      beatsNote.position = newValue.position;
    },
    deleteNote(barOrderIndex, beatOrderIndex, noteValue) {
      const currentNoteSheet = this.notesheets.notesheets[this.notesheetChoise];
      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      // Найти нужный bar по barId
      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }

      // Найти нужный beat внутри bar
      const beat = bar.beats.find((beat) => beat.orderIndex === beatOrderIndex);
      if (!beat) {
        console.warn("Beat not found");
        return;
      }
      const beatNote = beat.beatNotes.find(
        (beatNote) => beatNote.position.string === noteValue.position.string
      );
      const index = beat.beatNotes.findIndex(
        (beatNote) => beatNote.position.string === noteValue.position.string
      );

      if (index !== -1) {
        beat.beatNotes.splice(index, 1);
        console.log("Deleted beatNote", beatNote);
      } else {
        console.warn("beatNote не найден");
      }
    },
    fetchGetFretboard() {
      this.fretboard = null;
      const fretboardData = getFretboard();

      // this.fretboard = Object.freeze(fretboardData);
      this.fretboard = fretboardData;
    },
    setDuration() {
      this.duration = null;
      this.duration = getDurations();
    },
    setDurationForBeat(barOrderIndex, beatOrderIndex, value) {
      this.duration.then((duration) => {
        // console.log(duration.data);
        // Предполагаем, что duration.data — массив объектов или значений
        const finalDuration = duration.data.find((element) => {
          // если элементы — объекты и value сравниваем с некоторым свойством, например element.value
          // или если duration.data — массив простых значений, просто element === value
          return element.name == value;
        });
        const currentNoteSheet =
          this.notesheets.notesheets[this.notesheetChoise];
        if (!currentNoteSheet) {
          console.warn("Notesheet not found");
          return;
        }

        // Найти нужный bar по barId
        const bar = currentNoteSheet.bars.find(
          (bar) => bar.orderIndex === barOrderIndex
        );
        if (!bar) {
          console.warn("Bar not found");
          return;
        }

        // Найти нужный beat внутри bar
        const beat = bar.beats.find(
          (beat) => beat.orderIndex === beatOrderIndex
        );
        if (!beat) {
          console.warn("Beat not found");
          return;
        }
        beat.duration = finalDuration;
        // console.log(beat, finalDuration);
        // console.log(barOrderIndex, beatOrderIndex, value);
      });
    },
    checkDurations(barOrderIndex, beatOrderIndex, name) {
      const currentNoteSheet = this.notesheets.notesheets[this.notesheetChoise];
      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      // Найти нужный bar по barOrderIndex
      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }

      // Найти индекс текущего бита в массиве битов бара
      const beats = bar.beats;

      // Найти текущий beat по beatOrderIndex (параметру функции)
      const currentBeat = beats.find(
        (beat) => beat.orderIndex === beatOrderIndex
      );
      if (!currentBeat) {
        console.warn("Current beat not found");
        return;
      }

      let x1 = 55;
      let x2 = 90;

      // Найти следующий beat с orderIndex + 1
      const nextBeat = beats.find(
        (beat) => beat.orderIndex === beatOrderIndex + 1
      );
      const prevBeat = beats.find(
        (beat) => beat.orderIndex === beatOrderIndex - 1
      );

      if (nextBeat && nextBeat.duration?.name == name) {
        x2 = 250;
      } else if (prevBeat && prevBeat.duration?.name == name) {
        x2 = 55;
      }
      if (nextBeat == undefined) {
        x2 = 90;
      }
      // Найти предыдущий beat с orderIndex - 1

      if (prevBeat == undefined) {
      }
      if (prevBeat && prevBeat.duration?.name == name) {
        x1 = -100;
        if (nextBeat == undefined) {
          x2 = 55;
        }
      }

      return { x1, x2 };

      // const beats = bar.beats;
      // const currentIndex = beats.findIndex(
      //   (beat) => beat.orderIndex === beatOrderIndex
      // );
      // if (currentIndex === -1) {
      //   console.warn("Current beat not found");
      //   return;
      // }

      // let x1 = 0;
      // let x2 = 0;

      // // Проверяем следующий beat, если он есть
      // const nextBeat = beats[currentIndex + 1];
      // if (nextBeat && nextBeat.duration?.name === name) {
      //   x2 = 250;
      // }

      // // Проверяем предыдущий beat, если он есть
      // const prevBeat = beats[currentIndex - 1];
      // if (prevBeat && prevBeat.duration?.name === name) {
      //   x1 = -100;
      // }

      // // Можно вернуть объект с результатами или сделать с ними что-то еще
      // return { x1, x2 };
    },
    async changeBarSize(barOrderIndex, value) {
      const currentNoteSheet = this.notesheets.notesheets[this.notesheetChoise];
      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      // this.timeSignature.then((result) => {
      //   console.log("timeSignature data:", result.data);
      // });
      const result = await this.timeSignature;
      const matchedTimeSignature = result.data.find(
        (ts) => ts.upper == value.upper && ts.lower == value.lower
      );
      if (!matchedTimeSignature) {
        console.warn("matchedTimeSignature not found");
        return;
      }
      // Найти нужный bar по barOrderIndex
      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }
      bar.timeSignature = matchedTimeSignature;
    },
    setTimeSignatures() {
      this.timeSignature = getTimeSignatures();
    },
    async fetchSaveNotesheet(data) {
      return await saveNotesheet(data);
    },
    async deleteNotesheet(index) {
      // проверяем, что индекс валиден
      // if (index < 0 || index >= this.notesheets.notesheets.length) {
      //   console.warn("Индекс вне диапазона");
      //   return;
      // }
      console.log(index);
      const id = this.notesheets.notesheets[index].id;
      // удаляем notesheet по индексу
      this.notesheets.notesheets.splice(index, 1);
      await deleteNotesheet(id);

      // если нужно, можно синхронизировать с сервером или сохранить изменения
      // await someApi.deleteNotesheet(id);
    },
    async setInstruments() {
      this.instruments = await getInstruments();
    },
    async setTunings() {
      this.tunings = await getTunings();
    },
  },
});
