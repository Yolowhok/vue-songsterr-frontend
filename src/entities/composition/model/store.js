import { defineStore } from "pinia";
import {
  getCompositions,
  saveComposition,
  saveCompositionFull,
  getCompositionByIdFull,
  deleteComposition,
  createComposition,
  addBarPoint,
  deleteBarPoint,
  insertBeatPoint,
  deleteBeatPoint,
  upsertBeatPoint,
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
import {
  buildTimeline,
  findSegmentAt,
} from "@/shared/lib/playbackTimeline.js";

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
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
    saveError: null,
    undoStack: [],
    redoStack: [],
    _historySuspended: false,
    /** @type {{ barOrder: number, beatOrder: number, string: number } | null} */
    cursor: null,
    _fretTypeBuffer: "",
    _fretTypeTimer: null,
    isPlaying: false,
    elapsedMs: 0,
    playbackRate: 1,
    /** @type {{ barOrder: number, beatOrder: number, progress: number } | null} */
    playhead: null,
    _playbackSegments: [],
    _playbackTotalMs: 0,
    _playbackRaf: null,
    _playbackLastTs: null,
    _playbackLastBeatKey: null,
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
    getIsDirty: (state) => state.isDirty,
    getIsSaving: (state) => state.isSaving,
    getLastSavedAt: (state) => state.lastSavedAt,
    getSaveError: (state) => state.saveError,
    canUndo: (state) => state.undoStack.length > 0,
    canRedo: (state) => state.redoStack.length > 0,
    getCursor: (state) => state.cursor,
    getIsPlaying: (state) => state.isPlaying,
    getPlayhead: (state) => state.playhead,
    getPlaybackRate: (state) => state.playbackRate,
    saveStatusLabel: (state) => {
      if (state.isSaving) return "Сохранение…";
      if (state.saveError) return "Ошибка сохранения";
      if (state.isDirty) return "Не сохранено";
      if (state.lastSavedAt) return "Сохранено";
      return "";
    },
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
    _cloneCurrentNotesheet() {
      const ns = this.getComposition?.notesheets?.[this.chosenNotesheet];
      if (!ns) return null;
      return JSON.parse(JSON.stringify(ns));
    },
    pushHistory() {
      if (this._historySuspended) return;
      const snapshot = this._cloneCurrentNotesheet();
      if (!snapshot) return;
      this.undoStack.push(snapshot);
      if (this.undoStack.length > 50) this.undoStack.shift();
      this.redoStack = [];
    },
    undo() {
      if (!this.undoStack.length || !this.getComposition?.notesheets) return;
      const current = this._cloneCurrentNotesheet();
      const previous = this.undoStack.pop();
      if (current) this.redoStack.push(current);
      this._historySuspended = true;
      this.getComposition.notesheets[this.chosenNotesheet] = previous;
      this.checkAllDurations();
      this._historySuspended = false;
      this.markDirty();
    },
    redo() {
      if (!this.redoStack.length || !this.getComposition?.notesheets) return;
      const current = this._cloneCurrentNotesheet();
      const next = this.redoStack.pop();
      if (current) this.undoStack.push(current);
      this._historySuspended = true;
      this.getComposition.notesheets[this.chosenNotesheet] = next;
      this.checkAllDurations();
      this._historySuspended = false;
      this.markDirty();
    },
    resetHistory() {
      this.undoStack = [];
      this.redoStack = [];
    },
    markDirty() {
      this.isDirty = true;
      this.saveError = null;
      this.scheduleAutosave();
      if (this.isPlaying) {
        this.rebuildPlaybackTimeline();
      }
    },
    clearDirty() {
      this.isDirty = false;
      this.saveError = null;
    },
    scheduleAutosave() {
      if (typeof window === "undefined") return;
      if (window.__tabmakerAutosaveTimer) {
        clearTimeout(window.__tabmakerAutosaveTimer);
      }
      window.__tabmakerAutosaveTimer = setTimeout(() => {
        this.saveCompositionNow();
      }, 1800);
    },
    flushAutosaveTimer() {
      if (typeof window !== "undefined" && window.__tabmakerAutosaveTimer) {
        clearTimeout(window.__tabmakerAutosaveTimer);
        window.__tabmakerAutosaveTimer = null;
      }
    },
    async saveCompositionNow() {
      this.flushAutosaveTimer();
      if (!this.getComposition?.id) return;
      if (this.isSaving) return;
      this.isSaving = true;
      this.saveError = null;
      try {
        const payload = JSON.parse(JSON.stringify(this.getComposition));
        const response = await saveCompositionFull(payload);
        if (response?.data) {
          // Merge server IDs into the live graph instead of replacing it —
          // a full replace remounts editor UI and closes open panels/editors.
          this._mergeCompositionFromServer(response.data);
        }
        this.isDirty = false;
        this.lastSavedAt = Date.now();
        this.setCacheComposition(this.composition);
      } catch (e) {
        this.saveError = e?.message || "Save failed";
        console.error("Autosave failed", e);
      } finally {
        this.isSaving = false;
      }
    },
    _mergeCompositionFromServer(server) {
      if (!server || !this.composition) return;
      if (server.id != null) this.composition.id = server.id;
      if (server.updatedAt != null) this.composition.updatedAt = server.updatedAt;
      if (server.title != null) this.composition.title = server.title;
      if (server.band != null) this.composition.band = server.band;

      const localSheets = this.composition.notesheets || [];
      const serverSheets = server.notesheets || [];
      for (let i = 0; i < localSheets.length && i < serverSheets.length; i++) {
        this._mergeNotesheetFromServer(localSheets[i], serverSheets[i]);
      }
    },
    _mergeNotesheetFromServer(local, server) {
      if (!local || !server) return;
      if (server.id != null) local.id = server.id;
      if (server.instrument) local.instrument = server.instrument;
      if (server.tuning) local.tuning = server.tuning;

      const localBars = local.bars || [];
      const serverBars = server.bars || [];
      for (const localBar of localBars) {
        const serverBar = serverBars.find(
          (b) => b.orderIndex === localBar.orderIndex
        );
        if (!serverBar) continue;
        if (serverBar.id != null) localBar.id = serverBar.id;
        if (serverBar.tempInBpm != null) localBar.tempInBpm = serverBar.tempInBpm;
        if (serverBar.timeSignature) localBar.timeSignature = serverBar.timeSignature;

        const localBeats = localBar.beats || [];
        const serverBeats = serverBar.beats || [];
        for (const localBeat of localBeats) {
          const serverBeat = serverBeats.find(
            (b) => b.orderIndex === localBeat.orderIndex
          );
          if (!serverBeat) continue;
          if (serverBeat.id != null) localBeat.id = serverBeat.id;
          if (serverBeat.duration) localBeat.duration = serverBeat.duration;

          const localNotes = localBeat.beatNotes || [];
          const serverNotes = serverBeat.beatNotes || [];
          for (const localNote of localNotes) {
            const serverNote = serverNotes.find(
              (n) =>
                n?.position?.string === localNote?.position?.string
            );
            if (serverNote?.id != null) localNote.id = serverNote.id;
          }
        }
      }
    },
    _pointContext() {
      const compositionId = this.getComposition?.id;
      const notesheet = this.getComposition?.notesheets?.[this.chosenNotesheet];
      if (!compositionId || !notesheet?.id) return null;
      return { compositionId, notesheetId: notesheet.id };
    },
    _reconcileNotesheet(notesheet) {
      if (!notesheet || !this.getComposition?.notesheets) return;
      let idx = this.getComposition.notesheets.findIndex(
        (ns) => ns.id === notesheet.id
      );
      if (idx < 0) idx = this.chosenNotesheet;
      const local = this.getComposition.notesheets[idx];
      if (!local) {
        this.getComposition.notesheets[idx] = notesheet;
      } else {
        this._mergeNotesheetFromServer(local, notesheet);
        // Structural bar/beat inserts/deletes: sync lists by orderIndex
        this._syncBarsFromServer(local, notesheet);
      }
      this.checkAllDurations();
    },
    _syncBarsFromServer(local, server) {
      const serverBars = server.bars || [];
      const nextBars = serverBars.map((serverBar) => {
        const existing = (local.bars || []).find(
          (b) => b.orderIndex === serverBar.orderIndex
        );
        if (!existing) return serverBar;
        this._mergeNotesheetBarBeats(existing, serverBar);
        return existing;
      });
      local.bars = nextBars;
    },
    _mergeNotesheetBarBeats(localBar, serverBar) {
      if (serverBar.id != null) localBar.id = serverBar.id;
      if (serverBar.tempInBpm != null) localBar.tempInBpm = serverBar.tempInBpm;
      if (serverBar.timeSignature) localBar.timeSignature = serverBar.timeSignature;
      const serverBeats = serverBar.beats || [];
      localBar.beats = serverBeats.map((serverBeat) => {
        const existing = (localBar.beats || []).find(
          (b) => b.orderIndex === serverBeat.orderIndex
        );
        if (!existing) return serverBeat;
        if (serverBeat.id != null) existing.id = serverBeat.id;
        if (serverBeat.duration) existing.duration = serverBeat.duration;
        const serverNotes = serverBeat.beatNotes || [];
        existing.beatNotes = serverNotes.map((serverNote) => {
          const existingNote = (existing.beatNotes || []).find(
            (n) => n?.position?.string === serverNote?.position?.string
          );
          if (!existingNote) return serverNote;
          if (serverNote.id != null) existingNote.id = serverNote.id;
          if (serverNote.noteOctave) existingNote.noteOctave = serverNote.noteOctave;
          if (serverNote.position) existingNote.position = serverNote.position;
          return existingNote;
        });
        return existing;
      });
    },
    async _syncPointOrRollback(request) {
      try {
        const response = await request;
        if (response?.data) {
          this._reconcileNotesheet(response.data);
        }
        this.lastSavedAt = Date.now();
        return true;
      } catch (e) {
        console.error("Point API failed, rolling back", e);
        this.saveError = e?.message || "Point edit failed";
        this.undo();
        return false;
      }
    },

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
        this.clearDirty();
        this.resetHistory();
        this.cursor = null;
        this._clearFretTypeBuffer();
        this.stopPlayback();
        console.log("Composition is load");
      } catch (e) {
        console.error("Ошибка при загрузке notesheets", e);
        throw e;
      }
    },
    setCursor({ barOrder, beatOrder, string }) {
      if (!this.editModeStatus) return;
      const s = Math.min(6, Math.max(1, Number(string) || 1));
      this.cursor = {
        barOrder: Number(barOrder),
        beatOrder: Number(beatOrder),
        string: s,
      };
      this._clearFretTypeBuffer();
      this._scrollCursorIntoView();
    },
    clearCursor() {
      this.cursor = null;
      this._clearFretTypeBuffer();
    },
    ensureCursor() {
      if (!this.editModeStatus) return null;
      if (this.cursor) return this.cursor;
      const bars = this._sortedBars();
      if (!bars.length) return null;
      const beats = this._sortedBeats(bars[0]);
      if (!beats.length) return null;
      this.setCursor({
        barOrder: bars[0].orderIndex,
        beatOrder: beats[0].orderIndex,
        string: 1,
      });
      return this.cursor;
    },
    _sortedBars() {
      const ns = this.getComposition?.notesheets?.[this.chosenNotesheet];
      if (!ns?.bars?.length) return [];
      return [...ns.bars].sort((a, b) => a.orderIndex - b.orderIndex);
    },
    _sortedBeats(bar) {
      if (!bar?.beats?.length) return [];
      return [...bar.beats].sort((a, b) => a.orderIndex - b.orderIndex);
    },
    _findBar(barOrder) {
      return this._sortedBars().find((b) => b.orderIndex === barOrder) || null;
    },
    _scrollCursorIntoView() {
      if (typeof document === "undefined" || !this.cursor) return;
      const { barOrder, beatOrder, string } = this.cursor;
      const sel = `[data-tab-cell="${barOrder}-${beatOrder}-${string}"]`;
      const scrollIfNearEdge = () => {
        const el = document.querySelector(sel);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const headerH =
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--header-height"
            )
          ) || 0;
        const viewRight = window.innerWidth;
        const viewTop = headerH;
        const viewBottom = window.innerHeight - headerH;
        const viewW = viewRight;
        const viewH = Math.max(0, viewBottom - viewTop);
        const marginX = Math.max(180, Math.min(420, viewW * 0.3));
        const marginY = Math.max(72, Math.min(160, viewH * 0.22));
        let dx = 0;
        let dy = 0;
        if (rect.right > viewRight - marginX) {
          dx = rect.right - (viewRight - marginX);
        } else if (rect.left < marginX) {
          dx = rect.left - marginX;
        }
        if (rect.bottom > viewBottom - marginY) {
          dy = rect.bottom - (viewBottom - marginY);
        } else if (rect.top < viewTop + marginY) {
          dy = rect.top - (viewTop + marginY);
        }
        if (dx || dy) {
          window.scrollBy({ left: dx, top: dy, behavior: "auto" });
        }
      };
      // Double rAF: newly inserted beats are not in the DOM until Vue paints.
      requestAnimationFrame(() => requestAnimationFrame(scrollIfNearEdge));
    },
    _clearFretTypeBuffer() {
      this._fretTypeBuffer = "";
      if (typeof window !== "undefined" && this._fretTypeTimer) {
        clearTimeout(this._fretTypeTimer);
        this._fretTypeTimer = null;
      }
    },
    /**
     * @param {number} dx beat direction: -1 | 1
     * @param {number} dy string direction: -1 | 1 (up decreases string index toward 1)
     */
    moveCursor(dx, dy) {
      if (!this.editModeStatus) return;
      const cursor = this.ensureCursor();
      if (!cursor) return;

      if (dy) {
        const nextString = Math.min(6, Math.max(1, cursor.string + dy));
        if (nextString !== cursor.string) {
          this.setCursor({ ...cursor, string: nextString });
        }
        return;
      }

      if (!dx) return;
      const bars = this._sortedBars();
      const barIdx = bars.findIndex((b) => b.orderIndex === cursor.barOrder);
      if (barIdx < 0) return;
      const bar = bars[barIdx];
      const beats = this._sortedBeats(bar);
      const beatIdx = beats.findIndex((b) => b.orderIndex === cursor.beatOrder);

      if (dx > 0) {
        if (beatIdx >= 0 && beatIdx < beats.length - 1) {
          this.setCursor({
            ...cursor,
            beatOrder: beats[beatIdx + 1].orderIndex,
          });
          return;
        }
        if (barIdx < bars.length - 1) {
          const nextBar = bars[barIdx + 1];
          const nextBeats = this._sortedBeats(nextBar);
          if (!nextBeats.length) return;
          this.setCursor({
            ...cursor,
            barOrder: nextBar.orderIndex,
            beatOrder: nextBeats[0].orderIndex,
          });
          return;
        }
        // Last bar, last beat → append beat
        const lastOrder = beats.length
          ? beats[beats.length - 1].orderIndex
          : 0;
        const newOrder = lastOrder + 1;
        this.addBeat(cursor.barOrder, newOrder);
        this.setCursor({
          ...cursor,
          beatOrder: newOrder,
        });
        return;
      }

      // dx < 0
      if (beatIdx > 0) {
        this.setCursor({
          ...cursor,
          beatOrder: beats[beatIdx - 1].orderIndex,
        });
        return;
      }
      if (barIdx > 0) {
        const prevBar = bars[barIdx - 1];
        const prevBeats = this._sortedBeats(prevBar);
        if (!prevBeats.length) return;
        this.setCursor({
          ...cursor,
          barOrder: prevBar.orderIndex,
          beatOrder: prevBeats[prevBeats.length - 1].orderIndex,
        });
      }
    },
    insertBarRightAtCursor() {
      if (!this.editModeStatus) return;
      const cursor = this.ensureCursor();
      if (!cursor) return;
      const string = cursor.string;
      const newBarOrder = cursor.barOrder + 1;
      this.addBarRight(cursor.barOrder);
      this.setCursor({
        barOrder: newBarOrder,
        beatOrder: 1,
        string,
      });
    },
    insertBarLeftAtCursor() {
      if (!this.editModeStatus) return;
      const cursor = this.ensureCursor();
      if (!cursor) return;
      const string = cursor.string;
      const newBarOrder = cursor.barOrder;
      this.addBarLeft(cursor.barOrder);
      this.setCursor({
        barOrder: newBarOrder,
        beatOrder: 1,
        string,
      });
    },
    typeFretAtCursor(digitChar) {
      if (!this.editModeStatus) return;
      const cursor = this.ensureCursor();
      if (!cursor) return;
      if (!/^\d$/.test(digitChar)) return;

      const next = this._fretTypeBuffer + digitChar;
      const asNum = Number(next);
      if (asNum > 24) {
        this._fretTypeBuffer = digitChar;
      } else {
        this._fretTypeBuffer = next;
      }
      this._applyFretBuffer(cursor);

      if (typeof window !== "undefined") {
        if (this._fretTypeTimer) clearTimeout(this._fretTypeTimer);
        this._fretTypeTimer = setTimeout(() => {
          this._clearFretTypeBuffer();
        }, 600);
      }
    },
    _applyFretBuffer(cursor) {
      const fret = Number(this._fretTypeBuffer);
      if (Number.isNaN(fret) || fret < 0 || fret > 24) return;
      const cell =
        this.getFretboard?.[cursor.string]?.[fret] ??
        this.fretboard?.[cursor.string]?.[fret];
      if (!cell) return;
      const newValue = JSON.parse(JSON.stringify(cell));
      const ns = this.getComposition?.notesheets?.[this.chosenNotesheet];
      const bar = ns?.bars?.find((b) => b.orderIndex === cursor.barOrder);
      const beat = bar?.beats?.find((b) => b.orderIndex === cursor.beatOrder);
      if (!beat) return;
      const existing = beat.beatNotes?.find(
        (bn) => bn?.position?.string === cursor.string
      );
      if (existing) {
        this.updateNoteValue(cursor.barOrder, cursor.beatOrder, newValue);
      } else {
        this.addNote(cursor.barOrder, cursor.beatOrder, newValue);
      }
    },
    clearNoteAtCursor() {
      if (!this.editModeStatus) return;
      const cursor = this.ensureCursor();
      if (!cursor) return;
      this._clearFretTypeBuffer();
      const ns = this.getComposition?.notesheets?.[this.chosenNotesheet];
      const bar = ns?.bars?.find((b) => b.orderIndex === cursor.barOrder);
      const beat = bar?.beats?.find((b) => b.orderIndex === cursor.beatOrder);
      const note = beat?.beatNotes?.find(
        (bn) => bn?.position?.string === cursor.string
      );
      if (!note) return;
      this.deleteNote(cursor.barOrder, cursor.beatOrder, note);
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
    async _persistCurrentBeat(barOrderIndex, beatOrderIndex) {
      const ctx = this._pointContext();
      if (!ctx) return;
      const notesheet = this.getComposition?.notesheets?.[this.chosenNotesheet];
      const bar = notesheet?.bars?.find((b) => b.orderIndex === barOrderIndex);
      const beat = bar?.beats?.find((b) => b.orderIndex === beatOrderIndex);
      if (!beat) return;
      const payload = JSON.parse(JSON.stringify(beat));
      await this._syncPointOrRollback(
        upsertBeatPoint(
          ctx.compositionId,
          ctx.notesheetId,
          barOrderIndex,
          beatOrderIndex,
          payload
        )
      );
    },
    deleteNote(barOrderIndex, beatOrderIndex, noteValue) {
      this.pushHistory();
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
      this.markDirty();
      this._persistCurrentBeat(barOrderIndex, beatOrderIndex);
    },
    updateNoteValue(barOrderIndex, beatOrderIndex, newValue) {
      this.pushHistory();
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
      this.markDirty();
      this._persistCurrentBeat(barOrderIndex, beatOrderIndex);
    },
    addNote(barOrderIndex, beatOrderIndex, newValue) {
      this.pushHistory();
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
      this.markDirty();
      this._persistCurrentBeat(barOrderIndex, beatOrderIndex);
    },
    addBeat(barOrderIndex, beatOrderIndex) {
      this.pushHistory();
      const afterBeatOrder = beatOrderIndex === -1 ? 0 : beatOrderIndex - 1;
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
        this.markDirty();

        const ctx = this._pointContext();
        if (ctx) {
          this._syncPointOrRollback(
            insertBeatPoint(ctx.compositionId, ctx.notesheetId, barOrderIndex, {
              afterBeatOrder,
            })
          );
        }
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
      this.pushHistory();
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
        this.markDirty();
        const ctx = this._pointContext();
        if (ctx) {
          this._syncPointOrRollback(
            addBarPoint(ctx.compositionId, ctx.notesheetId, {
              side: "right",
              atOrderIndex: barIndex,
              tempInBpm: 120,
            })
          );
        }
      } catch (error) {
        console.error("Ошибка при добавлении бара справа:", error);
      }
    },
    addBarLeft(barIndex) {
      this.pushHistory();
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
        this.markDirty();
        const ctx = this._pointContext();
        if (ctx) {
          this._syncPointOrRollback(
            addBarPoint(ctx.compositionId, ctx.notesheetId, {
              side: "left",
              atOrderIndex: barIndex,
              tempInBpm: 120,
            })
          );
        }
      } catch (error) {
        console.error("Ошибка при добавлении бара слева:", error);
      }
    },
    deleteBar(orderIndexToDelete) {
      this.pushHistory();
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
        this.markDirty();
        const ctx = this._pointContext();
        if (ctx) {
          this._syncPointOrRollback(
            deleteBarPoint(
              ctx.compositionId,
              ctx.notesheetId,
              orderIndexToDelete
            )
          );
        }
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
      this.pushHistory();
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
      this.markDirty();
      this._persistCurrentBeat(barOrderIndex, beatOrderIndex);
    },
    updateDurationForBeat(barOrderIndex, beatOrderIndex, value) {
      this.pushHistory();
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
      this.markDirty();
      this._persistCurrentBeat(barOrderIndex, beatOrderIndex);
    },
    deleteBeat(barOrderIndex, beatOrderIndex) {
      this.pushHistory();
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
        this.markDirty();
        const ctx = this._pointContext();
        if (ctx) {
          this._syncPointOrRollback(
            deleteBeatPoint(
              ctx.compositionId,
              ctx.notesheetId,
              barOrderIndex,
              beatOrderIndex
            )
          );
        }
      } catch (error) {
        console.error("Error deleting beat:", error);
      }
    },
    updateBarSize(barOrderIndex, value) {
      this.pushHistory();
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
      this.markDirty();
    },
    changeEditModeStatus() {
      this.editModeStatus = !this.editModeStatus;
      if (this.editModeStatus) {
        this.ensureCursor();
      } else {
        this.clearCursor();
      }
    },

    rebuildPlaybackTimeline() {
      const ns = this.getComposition?.notesheets?.[this.chosenNotesheet];
      const { segments, totalMs } = buildTimeline(ns, this.playbackRate);
      this._playbackSegments = segments;
      this._playbackTotalMs = totalMs;
      if (this.elapsedMs > totalMs) {
        this.elapsedMs = totalMs;
      }
      this._syncPlayheadFromElapsed();
    },
    _syncPlayheadFromElapsed() {
      const hit = findSegmentAt(this._playbackSegments, this.elapsedMs);
      if (!hit) {
        this.playhead = null;
        return;
      }
      const key = `${hit.barOrder}-${hit.beatOrder}`;
      this._playbackLastBeatKey = key;
      this.playhead = {
        barOrder: hit.barOrder,
        beatOrder: hit.beatOrder,
        progress: hit.progress,
      };
      if (hit.ended && this.isPlaying) {
        this.pausePlayback();
        this.elapsedMs = this._playbackTotalMs;
        this.playhead = {
          barOrder: hit.barOrder,
          beatOrder: hit.beatOrder,
          progress: 1,
        };
      }
    },
    /**
     * Move the playhead to a beat (and optional 0–1 offset inside it).
     * Works while paused or playing.
     */
    seekPlayback(barOrder, beatOrder, progress = 0) {
      if (!this._playbackSegments.length) this.rebuildPlaybackTimeline();
      const seg = this._playbackSegments.find(
        (s) => s.barOrder === barOrder && s.beatOrder === beatOrder
      );
      if (!seg) return;
      const p = Math.min(1, Math.max(0, Number(progress) || 0));
      this.elapsedMs = seg.startMs + p * seg.durationMs;
      this._playbackLastTs = null;
      this._syncPlayheadFromElapsed();
    },
    _playbackFrame(ts) {
      if (!this.isPlaying) return;
      if (this._playbackLastTs == null) {
        this._playbackLastTs = ts;
      }
      const dt = ts - this._playbackLastTs;
      this._playbackLastTs = ts;
      this.elapsedMs = Math.min(this._playbackTotalMs, this.elapsedMs + dt);
      this._syncPlayheadFromElapsed();
      if (this.isPlaying) {
        this._playbackRaf = requestAnimationFrame((t) =>
          this._playbackFrame(t)
        );
      }
    },
    playPlayback() {
      this.rebuildPlaybackTimeline();
      if (!this._playbackSegments.length) return;
      if (this.elapsedMs >= this._playbackTotalMs) {
        this.elapsedMs = 0;
        this._playbackLastBeatKey = null;
      }
      this.isPlaying = true;
      this._playbackLastTs = null;
      if (this._playbackRaf) cancelAnimationFrame(this._playbackRaf);
      this._playbackRaf = requestAnimationFrame((t) =>
        this._playbackFrame(t)
      );
      this._syncPlayheadFromElapsed();
    },
    pausePlayback() {
      this.isPlaying = false;
      this._playbackLastTs = null;
      if (this._playbackRaf) {
        cancelAnimationFrame(this._playbackRaf);
        this._playbackRaf = null;
      }
    },
    stopPlayback() {
      this.pausePlayback();
      this.elapsedMs = 0;
      this._playbackLastBeatKey = null;
      this.rebuildPlaybackTimeline();
      if (this.cursor) {
        this.playhead = {
          barOrder: this.cursor.barOrder,
          beatOrder: this.cursor.beatOrder,
          progress: 0,
        };
      } else if (this._playbackSegments.length) {
        const first = this._playbackSegments[0];
        this.playhead = {
          barOrder: first.barOrder,
          beatOrder: first.beatOrder,
          progress: 0,
        };
      } else {
        this.playhead = null;
      }
    },
    togglePlayback() {
      if (this.isPlaying) this.pausePlayback();
      else this.playPlayback();
    },
    setPlaybackRate(rate) {
      const r = Number(rate);
      if (![0.5, 1, 1.5].includes(r)) return;
      const wasPlaying = this.isPlaying;
      if (wasPlaying) this.pausePlayback();
      const oldRate = this.playbackRate || 1;
      this.playbackRate = r;
      this.elapsedMs = (this.elapsedMs * oldRate) / r;
      this.rebuildPlaybackTimeline();
      if (wasPlaying) this.playPlayback();
    },
  },
});
