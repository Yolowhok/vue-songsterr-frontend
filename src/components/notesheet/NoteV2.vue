<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";

import { useMyStore } from "../../store/notesheet-store";
import { newStore } from "../../store/notesheet-store";

const store = newStore();
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
const oldStore = useMyStore();

// const board = ;

// watch(
//   () => store.notesheets.notesheets[store.notesheetChoise].bars,
//   (newVal, oldVal) => {
//     console.log("notesheets изменились", newVal);
//   }
// );
// watchEffect(() => {
//   console.log("notesheets сейчас:", store.notesheets);
// });

function startEdit() {
  // console.log(store.notesheets.notesheets[store.notesheetChoise]);
  editing.value = true;

  inputValue.value = props?.notevaluef?.position?.fret;

  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
      // При необходимости можно дальше выделить весь текст
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
    save();
  } else if (event.key === "Escape") {
    cancel();
  }
}
function onInput(event) {
  let val = event.target.value;

  // Оставляем только цифры
  val = val.replace(/[^\d ]/g, "");

  if (Number(val) <= 24) {
    event.target.value = val;
    inputValue.value = val;
  } else {
    // Иначе оставляем только последний символ
    event.target.value = val.slice(-1);
    inputValue.value = event.target.value;
  }
}
function onClickOutside(event) {
  if (!wrapperRef.value) return;

  // Если клик не внутри этого компонента и оно в режиме редактирования
  if (!wrapperRef.value.contains(event.target) && editing.value) {
    save();
    // editing.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});

onMounted(() => {});
</script>

<template lang="pug">
    div
        div.svg-content(@click="startEdit" ref="wrapperRef")
            div.svg-wrapper.svg-wrapper
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
                v-if="editing"
                ref="inputRef"
                class="overlay-input"
                type="number"
                v-model="inputValue"
                @keydown="onKeydown"
                @input="onInput"
                )
</template>

<style scoped>
/* Для браузеров на основе WebKit (Chrome, Safari, Edge) */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
  z-index: 200;
}

/* Для Firefox */
input[type="number"] {
  background-color: rgb(111, 0, 255);
  border-radius: 25%;
  color: white;
  /* color: rgb(204, 75, 75); */
  caret-color: transparent;
  z-index: 100;
}
.svg-content {
  position: relative;
  /* height: 1000%; */
  /* width: 100%; */
  display: flex;
  justify-content: center;
  text-align: center;
  z-index: 200;

  transition: transform 0.3s ease, filter 0.3s ease;
  cursor: pointer;

  /* УДАЛИТЬ */
  /* max-height: 15px; */
}

.svg-content:hover {
  transform: scale(1.2);
  z-index: 200;

  /* filter: drop-shadow(0 0px 6px rgba(0, 0, 0, 0.2)); */
}

.svg-content rect {
  transition: fill-opacity 0.3s ease;
  fill-opacity: 0.1;
  z-index: 200;
}

.svg-content:hover rect {
  fill-opacity: 1;
  z-index: 200;
}

/* обертка svg + текст */
.svg-wrapper {
  position: relative;
  width: 97%;
  height: 100%;
  z-index: 200;
}
.svg-wrapper:hover {
  transform: scale(1.1);

  border-radius: 25%;
  border: solid 2px rgb(131, 38, 251);
}

/* сам svg */
.svg-wrapper svg {
  display: block;
  width: 100%;
  height: 100%;
  z-index: 200;
}

/* input поверх текста */
.overlay-input {
  /* scale: 1.2; */
  color: red;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  font-size: 1.5rem;
  /* font-weight: bold; */
  text-align: center;
  font-family: inherit;
  color: black;

  background: transparent;
  border: none;
  outline: none;

  user-select: all;
  /* Чтобы курсор мыши норм был */
  cursor: text;
  z-index: 200;
}
.overlay-input::selection {
  background-color: #0000; /* цвет фона выделения */
  z-index: 200;
}
</style>
