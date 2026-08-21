<script setup>
import {
  defineProps,
  computed,
  ref,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import Ronde from "@/shared/assets/Ronde.svg";
import Quarter from "@/shared/assets/QUARTER.svg";
import Half from "@/shared/assets/half.svg";
import Eighth from "@/shared/assets/EIGHTH.svg";
import Sixteenth from "@/shared/assets/SIXTEENTH.svg";
import ThirtySecond from "@/shared/assets/THIRTY_SECOND.svg";
import SixtyFour from "@/shared/assets/SIXTY_FOUR.svg";
import trash from "@/shared/assets/trash1.svg";
import eventBus from "@/shared/lib/eventBus";
import { useCompositionStore } from "@/entities/composition";

const DURATION_ITEMS = [
  { id: "WHOLE", kind: "duration", name: "WHOLE" },
  { id: "HALF", kind: "duration", name: "HALF" },
  { id: "QUARTER", kind: "duration", name: "QUARTER" },
  { id: "EIGHTH", kind: "duration", name: "EIGHTH" },
  { id: "SIXTEENTH", kind: "duration", name: "SIXTEENTH" },
  { id: "THIRTY_SECOND", kind: "duration", name: "THIRTY_SECOND" },
  { id: "SIXTY_FOUR", kind: "duration", name: "SIXTY_FOUR" },
];

const RHYTHM_ITEMS = [
  { id: "dotted", kind: "rhythm", action: "dotted" },
  { id: "rest", kind: "rhythm", action: "rest" },
  { id: "tuplet", kind: "rhythm", action: "tuplet" },
];

const ARTIC_ITEMS = [
  { id: "tied", kind: "artic", action: "tied" },
  { id: "hammer", kind: "artic", action: "technique", technique: "hammer" },
  { id: "pull", kind: "artic", action: "technique", technique: "pull" },
  {
    id: "slide_up",
    kind: "artic",
    action: "technique",
    technique: "slide_up",
  },
  {
    id: "slide_down",
    kind: "artic",
    action: "technique",
    technique: "slide_down",
  },
  {
    id: "bend_half",
    kind: "artic",
    action: "technique",
    technique: "bend",
    bendValue: "half",
  },
  {
    id: "bend_full",
    kind: "artic",
    action: "technique",
    technique: "bend",
    bendValue: "full",
  },
];

const props = defineProps({
  barOrderIndex: Number,
  beatOrderIndex: Number,
});

const store = useCompositionStore();

const beat = computed(() => {
  const ns = store.getComposition?.notesheets?.[store.getChosenNotesheet];
  const bar = ns?.bars?.find((b) => b.orderIndex === props.barOrderIndex);
  return bar?.beats?.find((b) => b.orderIndex === props.beatOrderIndex) || null;
});

/** Note under global cursor (any beat) — articulations act on this. */
const cursorNote = computed(() => {
  const c = store.cursor;
  if (!c) return null;
  const ns = store.getComposition?.notesheets?.[store.getChosenNotesheet];
  const bar = ns?.bars?.find((b) => b.orderIndex === c.barOrder);
  const b = bar?.beats?.find((x) => x.orderIndex === c.beatOrder);
  return b?.beatNotes?.find((bn) => bn?.position?.string === c.string) || null;
});

const rows = computed(() => {
  const list = [DURATION_ITEMS, RHYTHM_ITEMS];
  if (cursorNote.value) list.push(ARTIC_ITEMS);
  return list;
});

/** Keyboard focus: [rowIndex, colIndex] */
const kbFocus = ref([0, 0]);

function clampFocus() {
  const r = rows.value;
  if (!r.length) {
    kbFocus.value = [0, 0];
    return;
  }
  let [row, col] = kbFocus.value;
  row = Math.max(0, Math.min(row, r.length - 1));
  const rowLen = r[row].length;
  col = Math.max(0, Math.min(col, rowLen - 1));
  kbFocus.value = [row, col];
}

function isKbFocusId(id) {
  const [row, col] = kbFocus.value;
  const item = rows.value[row]?.[col];
  return item?.id === id;
}

function initialFocusFromBeat() {
  const name = beat.value?.duration?.name;
  const idx = DURATION_ITEMS.findIndex((d) => d.name === name);
  kbFocus.value = [0, idx >= 0 ? idx : 0];
}

function onClick(name, { close = true } = {}) {
  store.updateDurationForBeat(props.barOrderIndex, props.beatOrderIndex, name);
  eventBus.emit("upd-beat");
  if (close) eventBus.emit("close-all-beat-panels");
}
function deleteBeat() {
  eventBus.emit("close-all-beat-panels");
  store.deleteBeat(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
}
function toggleDotted() {
  store.toggleBeatDotted(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
}
function toggleRest() {
  store.toggleBeatRest(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
}
function toggleTuplet() {
  store.toggleBeatTuplet(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
}
function toggleTied() {
  if (!cursorNote.value) return;
  store.toggleNoteTiedAtCursor();
  eventBus.emit("upd-beat");
}
function setTechnique(technique, bendValue = null) {
  if (!cursorNote.value) return;
  store.setNoteTechniqueAtCursor(technique, bendValue);
  eventBus.emit("upd-beat");
}

function applyItem(item) {
  if (!item) return;
  if (item.kind === "duration") {
    onClick(item.name, { close: false });
    return;
  }
  if (item.kind === "rhythm") {
    if (item.action === "dotted") toggleDotted();
    else if (item.action === "rest") toggleRest();
    else if (item.action === "tuplet") toggleTuplet();
    return;
  }
  if (item.kind === "artic") {
    if (item.action === "tied") toggleTied();
    else if (item.action === "technique") {
      setTechnique(item.technique, item.bendValue || null);
    }
  }
}

function moveFocus(dRow, dCol) {
  const r = rows.value;
  if (!r.length) return;
  let [row, col] = kbFocus.value;

  if (dCol !== 0) {
    const len = r[row].length;
    col = (col + dCol + len) % len;
    kbFocus.value = [row, col];
    return;
  }

  if (dRow !== 0) {
    const nextRow = (row + dRow + r.length) % r.length;
    const nextLen = r[nextRow].length;
    const nextCol = Math.min(col, nextLen - 1);
    kbFocus.value = [nextRow, nextCol];
  }
}

function onPanelKeyDown(event) {
  const key = event.key;
  if (
    key !== "ArrowLeft" &&
    key !== "ArrowRight" &&
    key !== "ArrowUp" &&
    key !== "ArrowDown" &&
    key !== "Enter" &&
    key !== "Escape"
  ) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();

  if (key === "Escape") {
    eventBus.emit("close-all-beat-panels");
    return;
  }
  if (key === "Enter") {
    const [row, col] = kbFocus.value;
    applyItem(rows.value[row]?.[col]);
    return;
  }
  if (key === "ArrowLeft") moveFocus(0, -1);
  else if (key === "ArrowRight") moveFocus(0, 1);
  else if (key === "ArrowUp") moveFocus(-1, 0);
  else if (key === "ArrowDown") moveFocus(1, 0);
}

watch(rows, () => clampFocus(), { deep: true });

onMounted(() => {
  initialFocusFromBeat();
  window.addEventListener("keydown", onPanelKeyDown, true);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onPanelKeyDown, true);
});
</script>

<template lang="pug">
  div.panel
    div.item-container.svg-container(
      :class="{ 'kb-focus': isKbFocusId('WHOLE') }"
      @click="onClick('WHOLE')"
    )
      Ronde
    div.item-container.svg-container.svg-container-quareter(
      :class="{ 'kb-focus': isKbFocusId('HALF') }"
      @click="onClick('HALF')"
    )
      Half(viewBox="0 -0.5 1.6343 4.132")
    div.item-container.svg-container.svg-container-half(
      :class="{ 'kb-focus': isKbFocusId('QUARTER') }"
      @click="onClick('QUARTER')"
    )
      Quarter(viewBox="0 0 25 30")
    div.item-container.svg-container(
      :class="{ 'kb-focus': isKbFocusId('EIGHTH') }"
      @click="onClick('EIGHTH')"
    )
      Eighth
    div.item-container.svg-container.svg-container-quareter(
      :class="{ 'kb-focus': isKbFocusId('SIXTEENTH') }"
      @click="onClick('SIXTEENTH')"
    )
      Sixteenth(viewBox="0 0 30 30")
    div.item-container.svg-container.svg-container-ThirtySecond(
      :class="{ 'kb-focus': isKbFocusId('THIRTY_SECOND') }"
      @click="onClick('THIRTY_SECOND')"
    )
      ThirtySecond(viewBox="-10 15 40 40")
    div.item-container.svg-container.svg-container-ThirtySecond(
      :class="{ 'kb-focus': isKbFocusId('SIXTY_FOUR') }"
      @click="onClick('SIXTY_FOUR')"
    )
      SixtyFour(viewBox="-10 15 40 40")
    div.item-container.svg-container.trash(@click="deleteBeat")
        trash.trash(viewBox="0 0 25 30")

    div.rhythm-row
      button.flag-btn(
        type="button"
        :class="{ active: beat?.dotted, 'kb-focus': isKbFocusId('dotted') }"
        title="Пунктир"
        @click.stop="toggleDotted"
      ) •
      button.flag-btn(
        type="button"
        :class="{ active: beat?.rest, 'kb-focus': isKbFocusId('rest') }"
        title="Пауза"
        @click.stop="toggleRest"
      ) 𝄽
      button.flag-btn(
        type="button"
        :class="{ active: beat?.tupletNum === 3 && beat?.tupletDen === 2, 'kb-focus': isKbFocusId('tuplet') }"
        title="Триоль 3:2"
        @click.stop="toggleTuplet"
      ) 3

    div.artic-row
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote?.tied, 'kb-focus': isKbFocusId('tied') }"
        :disabled="!cursorNote"
        title="Лига"
        @click.stop="toggleTied"
      ) ⌒
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote?.technique === 'hammer', 'kb-focus': isKbFocusId('hammer') }"
        :disabled="!cursorNote"
        title="Hammer-on"
        @click.stop="setTechnique('hammer')"
      ) H
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote?.technique === 'pull', 'kb-focus': isKbFocusId('pull') }"
        :disabled="!cursorNote"
        title="Pull-off"
        @click.stop="setTechnique('pull')"
      ) P
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote?.technique === 'slide_up', 'kb-focus': isKbFocusId('slide_up') }"
        :disabled="!cursorNote"
        title="Slide /"
        @click.stop="setTechnique('slide_up')"
      ) /
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote?.technique === 'slide_down', 'kb-focus': isKbFocusId('slide_down') }"
        :disabled="!cursorNote"
        title="Slide \\"
        @click.stop="setTechnique('slide_down')"
      ) \\
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote?.technique === 'bend' && cursorNote?.bendValue === 'half', 'kb-focus': isKbFocusId('bend_half') }"
        :disabled="!cursorNote"
        title="Bend ½"
        @click.stop="setTechnique('bend', 'half')"
      ) ½
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote?.technique === 'bend' && cursorNote?.bendValue === 'full', 'kb-focus': isKbFocusId('bend_full') }"
        :disabled="!cursorNote"
        title="Bend full"
        @click.stop="setTechnique('bend', 'full')"
      ) full
    div.artic-hint(v-if="!cursorNote") Кликни ноту (цифру), затем лига / H P / slide / bend
</template>

<style scoped>
.panel {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  height: auto;
  justify-content: flex-start;
  align-content: flex-start;
}
.trash:hover {
  color: #e63f3f;
  filter: drop-shadow(0 0 1px rgba(255, 0, 0, 0.3));
  transition: opacity 0.3s ease, filter 0.3s ease;
}
.item-container {
  display: flex;
  width: 20px;
  height: 30px;
  box-sizing: border-box;
  transition: opacity 0.3s ease, filter 0.3s ease;
  border-radius: 4px;
}
.item-container.svg-container:not(.svg-container-half) {
  justify-content: center;
  align-items: flex-end;
}
.item-container.svg-container.svg-container-half {
  justify-content: center;
  align-items: center;
}
.svg-container-quareter {
  justify-content: center;
  align-items: flex-end;
}
.item-container.svg-container.svg-container-ThirtySecond {
  justify-content: center;
  align-items: center;
}
.item-container.svg-container:hover {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  cursor: pointer;
}
.item-container.kb-focus {
  outline: 2px solid rgb(131, 38, 251);
  outline-offset: 2px;
  filter: drop-shadow(0 0 2px rgba(131, 38, 251, 0.45));
}
.rhythm-row,
.artic-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
  margin-top: 4px;
}
.flag-btn {
  min-width: 28px;
  height: 26px;
  padding: 0 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #555;
}
.flag-btn:hover:not(:disabled) {
  border-color: rgb(131, 38, 251);
  color: rgb(131, 38, 251);
}
.flag-btn.active {
  background: rgb(131, 38, 251);
  border-color: rgb(131, 38, 251);
  color: #fff;
}
.flag-btn.kb-focus {
  outline: 2px solid rgb(131, 38, 251);
  outline-offset: 1px;
  box-shadow: 0 0 0 1px rgba(131, 38, 251, 0.25);
}
.flag-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.artic-hint {
  width: 100%;
  font-size: 10px;
  color: #999;
  line-height: 1.3;
}
</style>
