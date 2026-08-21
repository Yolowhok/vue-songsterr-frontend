<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";

import { useCompositionStore } from "@/entities/composition";

const store = useCompositionStore();
const props = defineProps({
  beatNotes: {
    type: Object,
  },
  orderIndex: {
    type: Number,
  },
  numberString: {
    type: Number,
  },
  notevaluef: {
    type: Object,
  },
  barId: {
    type: Number,
  },
  beatId: {
    type: Number,
  },
  beatOrderIndex: {
    type: Number,
  },
});
const updated = ref(false);

const number = ref();
const editing = ref(false);
const inputValue = ref(number.value);
const wrapperRef = ref(null);
const cellRef = ref(null);
const inputRef = ref(null);

/** H/P/slide: gap from previous cell → this cell (local to this cell). */
const techniqueBridge = ref(null);
/** Tie: gap from this cell → next same-fret cell (local to this cell). */
const tieBridge = ref(null);

const isSelected = computed(() => {
  const c = store.cursor;
  if (!c || !store.getEditModeStatus) return false;
  return (
    c.barOrder === props.orderIndex &&
    c.beatOrder === props.beatOrderIndex &&
    c.string === props.numberString
  );
});

const note = computed(() => props.notevaluef || null);
const isTied = computed(() => Boolean(note.value?.tied));
const technique = computed(() => note.value?.technique || null);
const bendLabel = computed(() => {
  if (technique.value !== "bend") return "";
  return note.value?.bendValue === "full" ? "full" : "½";
});
const techniqueMark = computed(() => {
  switch (technique.value) {
    case "hammer":
      return "H";
    case "pull":
      return "P";
    case "slide_up":
      return "/";
    case "slide_down":
      return "\\";
    case "bend":
      return "↑";
    default:
      return "";
  }
});
const needsTechniqueBridge = computed(
  () => Boolean(techniqueMark.value && technique.value !== "bend")
);

function flattenBeats() {
  const ns = store.getComposition?.notesheets?.[store.getChosenNotesheet];
  if (!ns?.bars?.length) return [];
  const bars = [...ns.bars].sort((a, b) => a.orderIndex - b.orderIndex);
  const flat = [];
  for (const bar of bars) {
    const beats = [...(bar.beats || [])].sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    for (const beat of beats) {
      flat.push({ barOrder: bar.orderIndex, beatOrder: beat.orderIndex, beat });
    }
  }
  return flat;
}

/** direction: -1 previous note on this string, +1 next. */
function findNeighborNote(direction) {
  const flat = flattenBeats();
  const idx = flat.findIndex(
    (x) =>
      x.barOrder === props.orderIndex && x.beatOrder === props.beatOrderIndex
  );
  if (idx < 0) return null;
  const end = direction < 0 ? -1 : flat.length;
  for (let i = idx + direction; i !== end; i += direction) {
    const hit = flat[i].beat?.beatNotes?.find(
      (bn) => bn?.position?.string === props.numberString
    );
    if (hit) {
      return {
        barOrder: flat[i].barOrder,
        beatOrder: flat[i].beatOrder,
        string: props.numberString,
        note: hit,
      };
    }
  }
  return null;
}

const neighborPrev = computed(() => findNeighborNote(-1));
const neighborNext = computed(() => findNeighborNote(1));

const sameFretAs = (other) =>
  other?.position?.fret != null &&
  note.value?.position?.fret != null &&
  other.position.fret === note.value.position.fret;

/** Previous note is tied into this one (same string + same fret). */
const isTieContinuation = computed(() => {
  const prev = neighborPrev.value?.note;
  return Boolean(prev?.tied && sameFretAs(prev));
});

/** Draw a rightward arc only if the next note is the same pitch. */
const canDrawTie = computed(() => {
  if (!isTied.value) return false;
  return sameFretAs(neighborNext.value?.note);
});

const fretLabel = computed(() => {
  const fret = note.value?.position?.fret;
  if (fret == null || fret === "") return "";
  return isTieContinuation.value ? `(${fret})` : String(fret);
});

const fretFontSize = computed(() => {
  if (!isTieContinuation.value) return "90px";
  const fret = String(note.value?.position?.fret ?? "");
  return fret.length > 1 ? "48px" : "58px";
});

function gapGeometry(fromRect, toRect, originRect) {
  const left = fromRect.right - originRect.left;
  const width = Math.max(16, toRect.left - fromRect.right);
  // Filled ribbon: mild taper at tips, modest arch, thin mid body.
  const pad = 2;
  const tipY = 17;
  const endHalf = 0.95;
  const outerPeak = 0.8;
  const innerPeak = 4.6;
  const cx = width / 2;
  return {
    left,
    width,
    path: [
      `M ${pad} ${tipY - endHalf}`,
      `Q ${cx} ${outerPeak} ${width - pad} ${tipY - endHalf}`,
      `L ${width - pad} ${tipY + endHalf}`,
      `Q ${cx} ${innerPeak} ${pad} ${tipY + endHalf}`,
      "Z",
    ].join(" "),
  };
}

function updateBridge() {
  techniqueBridge.value = null;
  tieBridge.value = null;
  if (!cellRef.value) return;
  const cr = cellRef.value.getBoundingClientRect();
  if (cr.width <= 0) return;

  if (needsTechniqueBridge.value && neighborPrev.value) {
    const prev = neighborPrev.value;
    const prevEl = document.querySelector(
      `[data-tab-cell="${prev.barOrder}-${prev.beatOrder}-${prev.string}"]`
    );
    if (prevEl) {
      const pr = prevEl.getBoundingClientRect();
      if (pr.width > 0) {
        techniqueBridge.value = gapGeometry(pr, cr, cr);
      }
    }
  }

  if (canDrawTie.value && neighborNext.value) {
    const next = neighborNext.value;
    const nextEl = document.querySelector(
      `[data-tab-cell="${next.barOrder}-${next.beatOrder}-${next.string}"]`
    );
    if (nextEl) {
      const nr = nextEl.getBoundingClientRect();
      if (nr.width > 0) {
        tieBridge.value = gapGeometry(cr, nr, cr);
      }
    }
  }
}

function selectCell() {
  if (!store.getEditModeStatus) return;
  store.setCursor({
    barOrder: props.orderIndex,
    beatOrder: props.beatOrderIndex,
    string: props.numberString,
  });
}

function onCellClick(event) {
  if (!store.getEditModeStatus) return;
  // Only stop in edit mode so non-edit clicks bubble to onBeatSeek (mid-beat seek).
  event.stopPropagation();
  selectCell();
  startEdit();
}

function startEdit() {
  editing.value = true;

  inputValue.value = props?.notevaluef?.position?.fret;

  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
      inputRef.value.select();
    }
  });
}
function save(opts = {}) {
  const keepEditing = Boolean(opts.keepEditing);
  const val = String(inputValue.value ?? "").trim();
  const fretNum = val === "" ? NaN : Number(val);
  const validFret = val === "" || (!Number.isNaN(fretNum) && fretNum >= 0 && fretNum <= 24);

  if (!validFret) {
    if (!keepEditing) editing.value = false;
    return;
  }

  if (props.notevaluef != null) {
    if (val === "") {
      store.deleteNote(
        props.orderIndex,
        props.beatOrderIndex,
        props.notevaluef
      );
    } else {
      const board = store.getFretboard?.[Number(props.numberString)];
      const cell = board?.[Number(val)];
      if (!cell) {
        if (!keepEditing) editing.value = false;
        return;
      }
      const newValue = JSON.parse(JSON.stringify(cell));
      store.updateNoteValue(props.orderIndex, props.beatOrderIndex, newValue);
    }
  } else if (val !== "") {
    const board = store.fretboard?.[Number(props.numberString)];
    const cell = board?.[Number(val)];
    if (!cell) {
      if (!keepEditing) editing.value = false;
      return;
    }
    const newValue = JSON.parse(JSON.stringify(cell));
    store.addNote(props.orderIndex, props.beatOrderIndex, newValue);
  }

  if (!isNaN(parseInt(val, 10))) {
    number.value = val;
  }
  if (val === "") {
    number.value = "";
  }
  if (!keepEditing) {
    editing.value = false;
  }
  updated.value = !updated.value;
}
function onKeydown(event) {
  if (event.key === "Enter") {
    // Open beat panel via window hotkey — do not stopPropagation.
    event.preventDefault();
  } else if (event.key === "Escape") {
    event.preventDefault();
    // Beat panel owns Esc while open (capture handler closes it).
    if (document.querySelector(".beat-popup-panel")) return;
    store.clearCursor();
  } else if (
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight" ||
    event.key === "ArrowUp" ||
    event.key === "ArrowDown"
  ) {
    event.preventDefault();
    event.stopPropagation();
    save();
    selectCell();
    if (event.shiftKey && event.key === "ArrowRight") {
      store.insertBarRightAtCursor();
    } else if (event.shiftKey && event.key === "ArrowLeft") {
      store.insertBarLeftAtCursor();
    } else if (event.key === "ArrowRight") {
      store.moveCursor(1, 0);
    } else if (event.key === "ArrowLeft") {
      store.moveCursor(-1, 0);
    } else if (event.key === "ArrowDown") {
      store.moveCursor(0, 1);
    } else if (event.key === "ArrowUp") {
      store.moveCursor(0, -1);
    }
  }
}
function onInput(event) {
  let val = event.target.value;

  val = val.replace(/[^\d]/g, "");

  if (val === "" || Number(val) <= 24) {
    event.target.value = val;
    inputValue.value = val;
  } else {
    event.target.value = val.slice(-1);
    inputValue.value = event.target.value;
  }
  save({ keepEditing: true });
}
function onClickOutside(event) {
  if (!wrapperRef.value) return;
  if (!wrapperRef.value.contains(event.target) && editing.value) {
    save();
  }
}

watch(isSelected, (selected) => {
  if (selected) {
    startEdit();
  } else if (editing.value) {
    save();
  }
});

watch(
  [
    isTied,
    canDrawTie,
    needsTechniqueBridge,
    neighborPrev,
    neighborNext,
    () => props.notevaluef,
    () => props.orderIndex,
    () => props.beatOrderIndex,
  ],
  () => {
    nextTick(() => {
      updateBridge();
      nextTick(updateBridge);
    });
  }
);

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("resize", updateBridge);
  window.addEventListener("scroll", updateBridge, true);
  nextTick(updateBridge);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("resize", updateBridge);
  window.removeEventListener("scroll", updateBridge, true);
});
</script>

<template lang="pug">
    div(
      ref="cellRef"
      :data-tab-cell="`${props.orderIndex}-${props.beatOrderIndex}-${props.numberString}`"
      class="tab-cell"
    )
        div.svg-content(
          @click="onCellClick"
          ref="wrapperRef"
          :class="{ 'active': store.getEditModeStatus, 'cursor-selected': isSelected }"
        )
            div.svg-wrapper.svg-wrapper(
              :class="{ 'active': store.getEditModeStatus, 'cursor-selected': isSelected }"
            )
                svg(viewBox="0 0 100 100")
                      rect(x="0%" y="0%" width="100%" height="100%" rx="25%" ry="25%" fill="white")
                      text(
                        x="50%"
                        y="50%"
                        :font-size="fretFontSize"
                        dominant-baseline="middle"
                        text-anchor="middle"
                        dy="0.1em"
                        ) {{ fretLabel }}
                input(
                v-if="editing && store.getEditModeStatus"

                ref="inputRef"
                class="overlay-input"
                type="number"
                v-model="inputValue"
                @keydown="onKeydown"
                @input="onInput"
                )
            span.technique-mark.between(
              v-if="techniqueMark && technique !== 'bend' && techniqueBridge"
              :style="{ left: techniqueBridge.left + techniqueBridge.width / 2 + 'px' }"
              aria-hidden="true"
            ) {{ techniqueMark }}
            span.technique-mark.local(
              v-else-if="techniqueMark"
              aria-hidden="true"
            )
              | {{ techniqueMark }}
              span.bend-val(v-if="bendLabel") {{ bendLabel }}
        svg.tie-arc(
          v-if="tieBridge"
          :style="{ left: tieBridge.left + 'px', width: tieBridge.width + 'px' }"
          :viewBox="`0 0 ${tieBridge.width} 20`"
          aria-hidden="true"
        )
          path(:d="tieBridge.path" fill="#111")
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
  z-index: 200;
}
input[type="number"] {
  background-color: rgb(111, 0, 255);
  border-radius: 25%;
  color: white;
  caret-color: transparent;
  z-index: 100;
}
.svg-content {
  position: relative;
  display: flex;
  justify-content: center;
  text-align: center;
  z-index: 200;
  transition: transform 0.3s ease, filter 0.3s ease;
  cursor: default;
}
.svg-content.active {
  cursor: pointer;
}

.svg-content.active:hover {
  transform: scale(1.2);
  z-index: 200;
}
.svg-content rect {
  transition: fill-opacity 0.3s ease;
  fill-opacity: 0.1;
  z-index: 200;
}
.svg-content.active:hover rect {
  fill-opacity: 1;
  z-index: 200;
}
.svg-content.cursor-selected rect {
  fill: rgb(111, 0, 255);
  fill-opacity: 1;
}
.svg-wrapper {
  position: relative;
  width: 97%;
  height: 100%;
  z-index: 200;
}
.svg-wrapper.active:hover {
  transform: scale(1.1);
  border-radius: 25%;
  outline: solid 2px rgb(131, 38, 251);
}
.svg-wrapper.cursor-selected {
  border-radius: 25%;
  outline: solid 2px rgb(131, 38, 251);
  transform: scale(1.08);
}
.svg-wrapper svg {
  display: block;
  width: 100%;
  height: 100%;
  z-index: 200;
}
.overlay-input {
  color: red;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  font-size: 1.5rem;
  text-align: center;
  font-family: inherit;
  color: black;
  background: transparent;
  border: none;
  outline: none;
  user-select: all;
  cursor: text;
  z-index: 200;
}
.overlay-input::selection {
  background-color: #0000;
  z-index: 200;
}
.tab-cell {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.tie-arc {
  position: absolute;
  top: -12px;
  height: 20px;
  pointer-events: none;
  z-index: 210;
  overflow: visible;
  shape-rendering: geometricPrecision;
}
.technique-mark {
  position: absolute;
  font-size: 16px;
  font-weight: 700;
  color: rgb(131, 38, 251);
  pointer-events: none;
  z-index: 210;
  line-height: 1;
  white-space: nowrap;
}
.technique-mark.between {
  top: 50%;
  transform: translate(-50%, -50%);
}
.technique-mark.local {
  left: 72%;
  top: 50%;
  transform: translateY(-50%);
}
.bend-val {
  font-size: 11px;
  margin-left: 2px;
}
</style>
