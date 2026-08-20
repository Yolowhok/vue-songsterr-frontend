import { defineStore } from "pinia";
import {
  getCompositions,
  saveComposition,
  getCompositionByIdFull,
  deleteComposition,
  createComposition,
} from "@/entities/composition/api/compositionApi.js";
import { Bar } from "@/entities/bar";
import { getFretboard } from "@/shared/lib/fretboard.js";
import { getNoteOctavesOrdered } from "@/entities/catalog/api/notesApi.js";
import { Beat } from "@/entities/beat";
import { getDurations } from "@/entities/catalog/api/durationApi.js";
import { getTimeSignatures } from "@/entities/catalog/api/timeSignatureApi.js";
import { deleteNotesheet, saveNotesheet, createNotesheet } from "@/entities/notesheet/api/notesheetApi.js";
import { getInstruments } from "@/entities/catalog/api/instrumentApi.js";
import { getTunings } from "@/entities/catalog/api/tuningApi.js";
import { Duration } from "@/entities/catalog/model/Duration.js";
import { Composition } from "@/entities/composition/model/Composition.js";

export const useCompositionStore = defineStore("composition", {
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
    timeSignature: [],
    settings: {
      orientation: "nowrap",
    },
    tunings: [],
    instruments: [],
    cachedComposition: null,
    lastCompositionId: null,
    editModeStatus: false,
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
    getNotesheetList(state) {
      return this.getComposition?.notesheets ?? [];
    },
    getCachedComposition: (state) => state.cachedComposition,
    getLastCompositionId: (state) => state.lastCompositionId,
    getCurrentNotesheet: (state) => {
      return this.getComposition.notesheets[this.getChosenNotesheet];
    },
    getOrientation: (state) => {
      return state.settings.orientation;
    },
    getNoteOctavesOrdered: (state) => state.noteOctaveOrdered,
    getFretboard: (state) => state.fretboard,
    getInstruments: (state) => state.instruments,
    getTuningList: (state) => state.tunings,
    getDuration: (state) => state.durations,
    getPoints: (state) => state.points,
    getDefaultTuning: (state) => state.tunings[0] || [],
    getEditModeStatus: (state) => state.editModeStatus,
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
        this.compositionList = await response.data; // устанавливаем в state
        console.log("Composition list is load");
      } catch (e) {
        console.error("Ошибка при загрузке композиций", e);
      }
    },
    async fetchComposition(id) {
      try {
        const response = await getCompositionByIdFull(id);
        this.composition = response.data;
        console.log("Composition is load");
      } catch (e) {
        console.error("Ошибка при загрузке notesheets", e);
        throw e;
      }
    },
    async fetchCreateNotesheet(data) {
      try {
        console.log(data);
        const newNotesheet = await createNotesheet(data);
      } catch (e) {
        console.warn(e);
      }
    },
    async fetchDeleteNotesheet(index) {
      try {
        const id = this.getComposition.notesheets[index].id;
        console.log(id);
        await deleteNotesheet(id);
      } catch (e) {
        console.log(e);
      }
    },
    async fetchNoteOctaveOrdered() {
      try {
        const response = await getNoteOctavesOrdered();
        this.noteOctaveOrdered = response;
        console.log("NoteOctaveOrdered is load");
      } catch (e) {
        console.warn(e);
      }
    },
    async fetchDuration() {
      this.durations = null;
      this.durations = await getDurations();
      console.log("Duration is load");
    },
    async fetchTimeSignatures() {
      try {
        this.timeSignature = await getTimeSignatures();
        console.log("time signature is load");
      } catch (e) {
        console.warn(e);
      }
    },
    async fetchSaveNotesheet(data) {
      return await saveNotesheet(data);
    },
    async fetchCreateComposition(data) {
      try {
        const newComposition = Composition.create(data.band, data.title);
        const composition = await createComposition(newComposition);
        console.log("Composition is created");
        return composition;
      } catch (e) {
        console.warn(e);
      }
    },
    async fetchTuningList() {
      try {
        this.tunings = (await getTunings()).data;
        console.log("Tuning list is load");
      } catch (e) {
        console.warn(e);
      }
    },
    async fetchDeleteComposition(id) {
      try {
        await deleteComposition(id);
        // this.compositionList = this.compositionList.filter((c) => c.id !== id);
        this.cachedComposition = null;
        console.log("Composition is delete");
      } catch (e) {
        if (e.response?.status === 404) {
          console.error("Объект не найден");
        } else {
          console.error("Ошибка сервера", e);
        }
      }
    },
    async fetchInstruments() {
      try {
        this.instruments = (await getInstruments()).data;
      } catch (e) {
        console.warn(e);
      }
    },
    setCacheComposition(composition) {
      this.cachedComposition = composition;
      this.lastCompositionId = composition.id;
    },
    setFretboard() {
      this.fretboard = null;
      const notes = this.getNoteOctavesOrdered;
      const tuning =
        this.getComposition?.notesheets[this.chosenNotesheet]?.tuning;
      const fretboardData = getFretboard(notes, tuning);
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
      this.chosenComposition = composition;
      console.log("composition is chosed (only band and title)");
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
    addBeat(barOrderIndex, beatOrderIndex) {
      try {
        // 1. Создаем глубокую копию notesheet
        const currentNoteSheet =
          this.getComposition?.notesheets[this.chosenNotesheet];
        if (!currentNoteSheet || !Array.isArray(currentNoteSheet.bars)) {
          console.warn("Notesheet не найден или данные некорректны");
          return;
        }
        const notesheetCopy = JSON.parse(JSON.stringify(currentNoteSheet));

        // 2. Находим нужный bar в копии
        const bar = notesheetCopy.bars.find(
          (b) => b.orderIndex === barOrderIndex
        );
        if (!bar) {
          console.warn("Бар не найден с указанным orderIndex");
          return;
        }

        // 3. Инициализируем beats, если их нет
        if (!Array.isArray(bar.beats)) {
          bar.beats = [];
        }

        // 4. Обрабатываем вставку (beatOrderIndex === -1 → в начало)
        if (beatOrderIndex === -1) {
          // Смещаем все beats с orderIndex >= 1
          bar.beats.forEach((beat) => {
            if (beat.orderIndex >= 1) {
              beat.orderIndex += 1;
            }
          });
          beatOrderIndex = 1; // Новый beat будет с orderIndex = 1
        }

        // 5. Создаем новый beat
        const newBeat = Beat.create(Duration.create(), beatOrderIndex);

        // 6. Добавляем beat и сортируем
        bar.beats.push(newBeat);
        bar.beats.sort((a, b) => a.orderIndex - b.orderIndex);

        // 7. Заменяем оригинал обновленной копией
        this.getComposition.notesheets[this.chosenNotesheet] = notesheetCopy;
        this.checkAllDurations();
      } catch (error) {
        console.error("Ошибка при добавлении бита:", error);
      }
    },
    checkAllDurations() {
      const currentNoteSheet =
        this.getComposition?.notesheets[this.chosenNotesheet];
      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return; // Прерываем выполнение, если notesheet не найден
      }

      const beatsPoints = [];
      let globalBeatIndex = 0;

      currentNoteSheet?.bars.forEach((bar, barIndex) => {
        const beats = bar?.beats || [];

        beats.forEach((beat, beatIndex) => {
          beatsPoints.push({
            x1: 55,
            x2: 90,
            beatOrderIndex: beat.orderIndex,
            barOrderIndex: bar.orderIndex,
          });

          const currentBeat = beat;
          const nextBeat = beats[beatIndex + 1];
          const prevBeat = beats[beatIndex - 1];
          const currentPoint = beatsPoints[globalBeatIndex];

          if (prevBeat && nextBeat) {
            if (
              currentBeat?.duration?.durationValue ===
              prevBeat?.duration?.durationValue
            ) {
              currentPoint.x1 = -100;
              currentPoint.x2 = 55;
            }
            if (
              currentBeat?.duration?.durationValue ===
              nextBeat?.duration?.durationValue
            ) {
              currentPoint.x2 = 250;
            }
          } else if (!prevBeat) {
            currentPoint.x2 =
              currentBeat?.duration?.durationValue ===
              nextBeat?.duration?.durationValue
                ? 250
                : 90;
          } else if (!nextBeat) {
            currentPoint.x1 =
              currentBeat?.duration?.durationValue ===
              prevBeat?.duration?.durationValue
                ? -100
                : 55;
            currentPoint.x2 =
              currentBeat?.duration?.durationValue ===
              prevBeat?.duration?.durationValue
                ? 55
                : 90;
          }

          globalBeatIndex++; // Увеличиваем глобальный счетчик
        });
      });
      this.points = beatsPoints;
    },
    addBarRight(barIndex) {
      try {
        // Создаем глубокую копию текущего notesheet
        const currentNoteSheet = JSON.parse(
          JSON.stringify(this.getComposition?.notesheets[this.chosenNotesheet])
        );

        if (!currentNoteSheet || !Array.isArray(currentNoteSheet.bars)) {
          console.warn(
            "Невозможно добавить бар: данные отсутствуют или некорректны"
          );
          return;
        }

        // Создаем копию массива bars для безопасной работы
        const updatedBars = [...currentNoteSheet.bars];

        // Сортируем бары по orderIndex
        updatedBars.sort((a, b) => a.orderIndex - b.orderIndex);

        // Создаем новый бар с правильным orderIndex
        const newBar = Bar.create(120, barIndex + 1);

        // Обновляем orderIndex для всех баров справа от barIndex
        const updatedBarsWithShift = updatedBars.map((bar) => {
          if (bar.orderIndex > barIndex) {
            return { ...bar, orderIndex: bar.orderIndex + 1 };
          }
          return bar;
        });

        // Добавляем новый бар
        updatedBarsWithShift.push(newBar);

        // Сортируем снова (хотя теоретически не нужно, так как мы контролируем индексы)
        updatedBarsWithShift.sort((a, b) => a.orderIndex - b.orderIndex);

        // Обновляем состояние
        this.getComposition.notesheets[this.chosenNotesheet].bars =
          updatedBarsWithShift;

        console.log("Add bar right is done");
      } catch (error) {
        console.error("Ошибка при добавлении бара справа:", error);
      }
    },
    addBarLeft(barIndex) {
      try {
        // Создаем глубокую копию текущего notesheet
        const currentNoteSheet = JSON.parse(
          JSON.stringify(this.getComposition?.notesheets[this.chosenNotesheet])
        );

        if (!currentNoteSheet || !Array.isArray(currentNoteSheet.bars)) {
          console.warn(
            "Невозможно добавить бар: данные отсутствуют или некорректны"
          );
          return;
        }

        // Создаем копию массива bars для безопасной работы
        const updatedBars = [...currentNoteSheet.bars];

        // Сортируем бары по orderIndex
        updatedBars.sort((a, b) => a.orderIndex - b.orderIndex);

        // Создаем новый бар с правильным orderIndex
        const newBar = Bar.create(120, barIndex); // Новый бар получает orderIndex текущего бара

        // Обновляем orderIndex для всех баров начиная с barIndex
        const updatedBarsWithShift = updatedBars.map((bar) => {
          if (bar.orderIndex >= barIndex) {
            return { ...bar, orderIndex: bar.orderIndex + 1 };
          }
          return bar;
        });

        // Добавляем новый бар
        updatedBarsWithShift.push(newBar);

        // Сортируем снова
        updatedBarsWithShift.sort((a, b) => a.orderIndex - b.orderIndex);

        // Обновляем состояние
        this.getComposition.notesheets[this.chosenNotesheet].bars =
          updatedBarsWithShift;

        console.log("Add bar left is done");
      } catch (error) {
        console.error("Ошибка при добавлении бара слева:", error);
      }
    },
    deleteBar(orderIndexToDelete) {
      try {
        // Создаем глубокую копию текущего notesheet
        const currentNoteSheet = JSON.parse(
          JSON.stringify(this.getComposition?.notesheets[this.chosenNotesheet])
        );

        if (!currentNoteSheet || !Array.isArray(currentNoteSheet.bars)) {
          console.warn(
            "Невозможно удалить бар: данные отсутствуют или некорректны"
          );
          return;
        }

        // Фильтруем бары и обновляем индексы
        const updatedBars = currentNoteSheet.bars
          .filter((bar) => bar.orderIndex !== orderIndexToDelete)
          .map((bar) => ({
            ...bar,
            orderIndex:
              bar.orderIndex > orderIndexToDelete
                ? bar.orderIndex - 1
                : bar.orderIndex,
          }))
          .sort((a, b) => a.orderIndex - b.orderIndex);

        // Создаем обновленный notesheet
        const updatedNoteSheet = {
          ...currentNoteSheet,
          bars: updatedBars,
        };

        // Обновляем только выбранный notesheet
        this.getComposition.notesheets[this.chosenNotesheet] = updatedNoteSheet;

        console.log("Бар с orderIndex", orderIndexToDelete, "успешно удалён");
        console.log("Обновленные бары:", updatedBars);
      } catch (error) {
        console.error("Ошибка при удалении бара:", error);
      }
    },
    //   if (!beats) {
    //     console.warn("Notesheet not found");
    //   }
    //   const quartDuration = 0.25;

    //   const beatsPoints = [];
    //   beats.forEach((beat, index) => {
    //     beatsPoints.push({ x1: 55, x2: 90 });
    //     let currentBeat = beat;
    //     let nextBeat = beats[index + 1];
    //     let prevBeat = beats[index - 1];

    //     if (
    //       (currentBeat?.duration?.durationValue ==
    //         prevBeat?.duration?.durationValue ||
    //         currentBeat?.duration?.durationValue ==
    //           prevBeat?.duration?.durationValue) &&
    //       prevBeat?.duration?.durationValue != 0.25
    //     ) {
    //       beatsPoints[index].x1 = -100;
    //     }
    //     if (
    //       (currentBeat?.duration?.durationValue ==
    //         nextBeat?.duration?.durationValue ||
    //         currentBeat?.duration?.durationValue ==
    //           nextBeat?.duration?.durationValue) &&
    //       nextBeat?.duration?.durationValue != 0.25
    //     ) {
    //       beatsPoints[index].x2 = 250;
    //     }
    //     if (
    //       !nextBeat &&
    //       prevBeat?.duration?.durationValue ==
    //         currentBeat?.duration?.durationValue
    //     ) {
    //       beatsPoints[index].x2 = 55;
    //     }
    //     if (
    //       nextBeat?.duration?.durationValue !=
    //         currentBeat?.duration?.durationValue &&
    //       currentBeat?.duration?.durationValue ==
    //         prevBeat?.duration?.durationValue
    //     ) {
    //       beatsPoints[index].x2 = 55;
    //     }
    //   });
    //   this.points = beatsPoints;
    //   return beatsPoints;
    // },
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
        // first beat in bar — x1 stays default
      }
      if (prevBeat && prevBeat.duration?.name == name) {
        x1 = -100;
        if (nextBeat == undefined) {
          x2 = 55;
        }
      }

      return { x1, x2 };
    },
    //   try {
    //     // 1. Находим finalDuration (до работы с копией, чтобы не делать это в цикле)
    //     const finalDuration = this.durations.data.find((d) => d.name === value);
    //     console.log(
    //       "barOrderIndex, beatOrderIndex, value",
    //       barOrderIndex,
    //       beatOrderIndex,
    //       value
    //     );
    //     if (!finalDuration) {
    //       console.warn("Duration not found");
    //       return;
    //     }

    //     // 2. Создаем глубокую копию notesheet
    //     const currentNoteSheet =
    //       this.getComposition?.notesheets[this.chosenNotesheet];
    //     if (!currentNoteSheet) {
    //       console.warn("Notesheet not found");
    //       return;
    //     }
    //     const notesheetCopy = JSON.parse(JSON.stringify(currentNoteSheet));

    //     // 3. Находим bar и beat в копии
    //     const bar = notesheetCopy.bars.find(
    //       (bar) => bar.orderIndex === barOrderIndex
    //     );
    //     if (!bar) {
    //       console.warn("Bar not found");
    //       return;
    //     }

    //     const beat = bar.beats.find(
    //       (beat) => beat.orderIndex === beatOrderIndex
    //     );
    //     if (!beat) {
    //       console.warn("Beat not found");
    //       return;
    //     }

    //     // 4. Обновляем duration в копии
    //     beat.duration = finalDuration;

    //     // 5. Заменяем оригинал обновленной копией
    //     this.getComposition.notesheets[this.chosenNotesheet] = notesheetCopy;

    //     console.log("Updated beat:", beat);
    //   } catch (error) {
    //     console.error("Error setting duration:", error);
    //   }
    // },
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
        try {
          beat.duration = finalDuration;
        } catch (e) {
          console.warn(e);
        }
        console.log("обновленный список битов", bar.beats);
        // console.log(beat, finalDuration);
        // console.log(barOrderIndex, beatOrderIndex, value);
      });
    },
    updateDurationForBeat(barOrderIndex, beatOrderIndex, value) {
      let finalDuration = "";
      this.durations.data.forEach((duration) => {
        finalDuration = this.durations.data.find((d) => d.name === value);
      });
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
      try {
        beat.duration = finalDuration;
      } catch (e) {
        console.warn(e);
      }
      // console.log("final", bar);

      console.log("Update duration for one beat is done");
    },
    deleteBeat(barOrderIndex, beatOrderIndex) {
      try {
        const currentNoteSheet =
          this.getComposition?.notesheets[this.chosenNotesheet];
        if (!currentNoteSheet) {
          console.warn("Notesheet not found");
          return;
        }

        // 1. Создаем глубокую копию notesheet (чтобы не мутировать исходный объект)
        const notesheetCopy = JSON.parse(JSON.stringify(currentNoteSheet));

        // 2. Находим нужный bar в копии
        const bar = notesheetCopy.bars.find(
          (bar) => bar.orderIndex === barOrderIndex
        );
        if (!bar) {
          console.warn("Bar not found");
          return;
        }

        // 3. Находим индекс beat в копии
        const beatIndex = bar.beats.findIndex(
          (beat) => beat.orderIndex === beatOrderIndex
        );
        if (beatIndex === -1) {
          console.warn("Beat not found");
          return;
        }

        // 4. Удаляем beat из копии
        bar.beats.splice(beatIndex, 1);

        // 5. Обновляем orderIndex у последующих beats в копии
        for (let i = beatIndex; i < bar.beats.length; i++) {
          bar.beats[i].orderIndex -= 1;
        }

        // 6. Заменяем оригинальный notesheet обновленной копией
        this.getComposition.notesheets[this.chosenNotesheet] = notesheetCopy;

        console.log("Updated bar:", bar);
      } catch (error) {
        console.error("Error deleting beat:", error);
      }
    },
    updateBarSize(barOrderIndex, value) {
      const currentNoteSheet =
        this.getComposition?.notesheets[this.chosenNotesheet];

      if (!currentNoteSheet) {
        console.warn("Notesheet not found");
        return;
      }

      const result = this.timeSignature;
      const matchedTimeSignature = result.data.find(
        (ts) => ts.upper == value.upper && ts.lower == value.lower
      );
      if (!matchedTimeSignature) {
        console.warn("matchedTimeSignature not found");
        return;
      }
      const bar = currentNoteSheet.bars.find(
        (bar) => bar.orderIndex === barOrderIndex
      );
      if (!bar) {
        console.warn("Bar not found");
        return;
      }
      bar.timeSignature = matchedTimeSignature;
    },
    changeEditModeStatus() {
      this.editModeStatus = !this.editModeStatus;
    },
  },
});
