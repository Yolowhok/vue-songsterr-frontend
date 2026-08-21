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
const inputRef = ref(null);

const isSelected = computed(() => {
  const c = store.cursor;
  if (!c || !store.getEditModeStatus) return false;
  return (
    c.barOrder === props.orderIndex &&
    c.beatOrder === props.beatOrderIndex &&
    c.string === props.numberString
  );
});

function selectCell() {
  if (!store.getEditModeStatus) return;
  store.setCursor({
    barOrder: props.orderIndex,
    beatOrder: props.beatOrderIndex,
    string: props.numberString,
  });
}

function onCellClick() {
  if (!store.getEditModeStatus) return;
  const already =
    store.cursor &&
    store.cursor.barOrder === props.orderIndex &&
    store.cursor.beatOrder === props.beatOrderIndex &&
    store.cursor.string === props.numberString;
  selectCell();
  if (already) {
    startEdit();
  }
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
function save() {
  const val = String(inputValue.value).trim();
  if (props.notevaluef != null) {
    if (val === "") {
      store.deleteNote(
        props.orderIndex,
        props.beatOrderIndex,
        props.notevaluef
      );
    } else {
      const newValue = JSON.parse(
        JSON.stringify(
          store.getFretboard[Number(props.numberString)][Number(val)]
        )
      );
      store.updateNoteValue(props.orderIndex, props.beatOrderIndex, newValue);
    }
  } else if (val != "undefined") {
    const newValue = JSON.parse(
      JSON.stringify(store.fretboard[Number(props.numberString)][Number(val)])
    );
    store.addNote(props.orderIndex, props.beatOrderIndex, newValue);
  }

  if (!isNaN(parseInt(val))) {
    number.value = val;
  }
  if (val == "") {
    number.value = "";
  }
  editing.value = false;
  updated.value = !updated.value;
}
function cancel() {
  editing.value = false;
}
function onKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    save();
  } else if (event.key === "Escape") {
    event.preventDefault();
    cancel();
  } else if (
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight" ||
    event.key === "ArrowUp" ||
    event.key === "ArrowDown"
  ) {
    event.preventDefault();
    event.stopPropagation();
    cancel();
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

  val = val.replace(/[^\d ]/g, "");

  if (Number(val) <= 24) {
    event.target.value = val;
    inputValue.value = val;
  } else {
    event.target.value = val.slice(-1);
    inputValue.value = event.target.value;
  }
}
function onClickOutside(event) {
  if (!wrapperRef.value) return;
  if (!wrapperRef.value.contains(event.target) && editing.value) {
    save();
  }
}

watch(isSelected, (selected) => {
  if (!selected && editing.value) {
    cancel();
  }
});

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<template lang="pug">
    div(
      :data-tab-cell="`${props.orderIndex}-${props.beatOrderIndex}-${props.numberString}`"
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
                        font-size="90px"
                        dominant-baseline="middle"
                        text-anchor="middle"
                        dy="0.1em"
                        ) {{ props?.notevaluef?.position?.fret }}
                input(
                v-if="editing && store.getEditModeStatus"

                ref="inputRef"
                class="overlay-input"
                type="number"
                v-model="inputValue"
                @keydown="onKeydown"
                @input="onInput"
                )
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
  outline: solid 2px #4c73fe;
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
</style>
