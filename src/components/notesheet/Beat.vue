<script setup>
import {
  defineProps,
  onMounted,
  ref,
  watchEffect,
  markRaw,
  onBeforeMount,
} from "vue";
import NoteList from "./NoteList.vue";
import { useMyStore } from "../../store/notesheet-store";
import BeatPanel from "../navigation/BeatPanel.vue";
import TrashIcon from "../../assets/menuLines.svg";
// или '../assets/logo.svg' в зависимости от структуры
import Eigth from "../SvgComponents/Eigth.vue";
import Quarter from "../SvgComponents/Quart.vue";

import { computed } from "vue";
import Sixteenth from "../SvgComponents/Sixteenth.vue";
import ThirtySeconds from "../SvgComponents/ThirtySeconds.vue";
import Half from "../SvgComponents/Half.vue";
import SixtyFour from "../SvgComponents/SixtyFour.vue";
import { watch } from "vue";
import eventBus from "../../eventBus";
import { newStore } from "../../store/notesheet-store";

const store = newStore();
const props = defineProps({
  beat: Object,
  orderIndex: Number,
  barId: Number,
  beatId: Number,
  beatOrderIndex: Number,
  points: Object,
});

const oldStore = useMyStore();

const isHovered = ref(false);

const showPanel = ref(false);
function togglePanel() {
  showPanel.value = !showPanel.value;
}
function onMouseLeave() {
  showPanel.value = false; // скрываем панель при уходе курсора
  isHovered.value = false;
}
function close() {
  if (showPanel.value != false) {
    console.log(true);
    showPanel.value = false; // скрываем панель при уходе курсора
  }
}

const SvgComponent = ref(null);
const svgProps = ref({});

function updateSvgComponent(val) {
  // console.log("upd");
  // const points = store.checkDurations(
  //   props.orderIndex,
  //   props.beatOrderIndex,
  //   val
  // );
  // const pointsMock = store.checkAllDurations(
  //   props.orderIndex,
  //   props.beatOrderIndex
  // );
  // console.log("VAL, beatOrderIndex", val, props.beatOrderIndex);
  // const points = store.getPoints[props.beatOrderIndex - 1];
  // console.log(store.getPoints, props.beatOrderIndex);
  // console.log("points FROM BEAT", store.getPoints, props.beatOrderIndex);
  const points = { x1: 55, x2: 90 };

  console.log(props);

  switch (val) {
    case "WHOLE":
      SvgComponent.value = null;
      svgProps.value = {};
      break;
    case "HALF":
      SvgComponent.value = markRaw(Half);
      svgProps.value = points;
      break;
    case "QUARTER":
      SvgComponent.value = markRaw(Quarter);
      svgProps.value = points;
      break;
    case "EIGHTH":
      SvgComponent.value = markRaw(Eigth);
      svgProps.value = points;
      break;
    case "SIXTEENTH":
      SvgComponent.value = markRaw(Sixteenth);
      svgProps.value = points;
      break;
    case "THIRTY_SECOND":
      SvgComponent.value = markRaw(ThirtySeconds);
      svgProps.value = points;
      break;
    case "SIXTY_FOUR":
      SvgComponent.value = markRaw(SixtyFour);
      svgProps.value = points;
      break;
  }
}

eventBus.on("update-all-beats", () => {
  // console.log(props);

  updateSvgComponent(props.beat?.duration?.name);
});

const durationName = computed(() => props.beat?.duration?.name);

// watch(store.composition, (newVal) => {
//   if (newVal) {
//     updateSvgComponent(val);
//   }
// });

watch(
  store.composition,
  (newVal) => {
    if (newVal) {
      // console.log("BEFORE");
      // updateSvgComponent(props.beat?.duration?.name);
      // console.log("AFTER");
      eventBus.emit("update-all-beats");
    }
  }
  // { immediate: true }
);

onBeforeMount(() => {
  const val = props.beat?.duration?.name;
  if (val) {
    updateSvgComponent(val);
  }
});
// Вынесите логику обновления в отдельную функцию
// function updateSvgComponent(val) {
//   const points = store.checkDurations(
//     props.orderIndex,
//     props.beatOrderIndex,
//     val
//   );
//   switch (val) {
//     case "WHOLE":
//       SvgComponent.value = null;
//       svgProps.value = {};
//       break;
//     case "HALF":
//       SvgComponent.value = markRaw(Half);
//       svgProps.value = points;
//       break;
//     case "QUARTER":
//       SvgComponent.value = markRaw(Quarter);
//       svgProps.value = points;
//       break;
//     case "EIGHTH":
//       SvgComponent.value = markRaw(Eigth);
//       svgProps.value = points;
//       break;
//     case "SIXTEENTH":
//       SvgComponent.value = markRaw(Sixteenth);
//       svgProps.value = points;
//       break;
//     case "THIRTY_SECOND":
//       SvgComponent.value = markRaw(ThirtySeconds);
//       svgProps.value = points;
//       break;
//     case "SIXTY_FOUR":
//       SvgComponent.value = markRaw(SixtyFour);
//       svgProps.value = points;
//       break;
//   }
// }
// const durationName = computed(() => props.beat?.duration?.name);

// watch(
//   durationName,
//   (newVal) => {
//     if (newVal) {
//       updateSvgComponent(newVal);
//       eventBus.emit("update-all-beats");
//     }
//   },
//   { immediate: true }
// );

watch(
  () => props.beat?.orderIndex,
  (newVal) => {
    updateSvgComponent(newVal);
    eventBus.emit("update-all-beats");
  },
  { immediate: true }
);

// eventBus.on("update-all-beats", () => {
//   updateSvgComponent(props.beat?.duration?.name);
// });

// const val = computed(
//   () => props.beat?.duration?.name,
//   () => {
//     console.log("DADADAAd");
//     if (val) updateSvgComponent(val);
//   }
// );

// onMounted(() => {
//   const val = props.beat?.duration?.name;
//   if (val) {
//     updateSvgComponent(val);
//     eventBus.emit("update-all-beats");
//   }
// });
</script>

<template lang="pug">

  div.beat-wrapper( @mouseenter="isHovered = true"  @mouseleave="onMouseLeave" style="position: relative;" )
    div.transparent-overlay
    div.beat
      NoteList(:beat="props.beat"
        :orderIndex="props.orderIndex"
        :barId="props.barId"
        :beatId="props?.beatId"
        :beatOrderIndex="props.beatOrderIndex")
    div
      TrashIcon.add-button.logo(@click="togglePanel" v-if="isHovered" viewBox="0 0 24 24" width="24" height="24" )
      div.popup-panel(v-if="showPanel"  @click="close")
          BeatPanel(:barOrderIndex="props.orderIndex" :beatOrderIndex="props.beatOrderIndex")

    component.eigth-svg(v-if="SvgComponent" :is="SvgComponent" :points="svgProps")



</template>

<style scoped>
.transparent-overlay {
  position: absolute;
  top: -50%;
  bottom: -50%;
  left: 0;
  right: 0;
  background: transparent; /* Прозрачный фон */
  z-index: -1; /* Чтобы не перекрывать контент */
  /* pointer-events: none; */
  /* Клики проходят сквозь него */
  /* border: 1px dashed rgba(0, 0, 255, 0.3); */
  /* Для визуализации (можно убрать) */
}
.eigth-svg {
  position: absolute;
  top: 110%; /* сразу под beat-wrapper */
  left: 47%;
  transform: translateX(-50%);
  margin-top: 5px; /* отступ при необходимости */
  pointer-events: none; /* чтобы svg не мешал кликам, если не нужен интерактив */
  z-index: 1;
}

.beat-wrapper {
  position: relative;
  /* чтобы не обрезать кнопку, пусть overflow будет visible */
  overflow: visible;
}

.add-button {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;

  cursor: pointer;

  /* убираем padding, border */
  padding: 10px 8px;
  border: none;

  color: #000;
}
.add-button:hover {
  /* color: #e63f3f; */
  color: rgb(111, 0, 255);
  filter: drop-shadow(0 0 1px rgba(255, 0, 0, 0.3));
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.add-button:active {
  color: #b83030;
  /* box-shadow: 0 2px 5px rgba(184, 48, 48, 0.7); */
}

.beat {
  position: relative;
  /* z-index: 2; */

  width: 30px;
  height: 115%;
  padding-left: 30px;
  padding-right: 30px;

  display: flex;
  align-items: center;
  justify-content: left;
  flex-direction: row;
}
.popup-panel {
  position: absolute;
  bottom: 0px; /* чуть выше кнопки */
  left: 60px;
  width: 100px;
  height: 200px;
  padding: 10px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 500;
  border-radius: 4px;
}
</style>
