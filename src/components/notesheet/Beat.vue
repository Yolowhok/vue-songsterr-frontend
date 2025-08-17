<script setup>
import {
  defineProps,
  onMounted,
  ref,
  watchEffect,
  markRaw,
  onUnmounted,
} from "vue";
import NoteList from "./NoteList.vue";
import { useMyStore } from "../../store/notesheet-store";
import BeatPanel from "../navigation/BeatPanel.vue";
import TrashIcon from "../../assets/menuLines.svg";
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
import DeleteBeat from "../SvgComponents/DeleteBeat.vue";

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
const showDeleteIcon = ref(false);

const panelRef = ref(null);
const buttonRef = ref(null);

const closeAllPanels = () => {
  showPanel.value = false;
  showDeleteIcon.value = false;
  isHovered.value = false;
};

onMounted(() => {
  eventBus.on("close-all-beat-panels", closeAllPanels);
  document.addEventListener("click", handleClickOutside);
  updateSvgComponent();
});

onUnmounted(() => {
  eventBus.off("close-all-beat-panels", closeAllPanels);
  document.removeEventListener("click", handleClickOutside);
});

const handleClickOutside = (event) => {
  if (panelRef.value && !panelRef.value.contains(event.target)) {
    showPanel.value = false;
  }
};

function onMouseEnter() {
  isHovered.value = true;
  showDeleteIcon.value = true;
}

function onMouseLeave() {
  isHovered.value = false;
  showDeleteIcon.value = false;
}

function togglePanel(event) {
  event.stopPropagation();
  eventBus.emit("close-all-beat-panels");
  eventBus.emit("close-bar-panels");
  eventBus.emit("close-bar-size-panel");
  showPanel.value = !showPanel.value;
}

const SvgComponent = ref(null);

const svgProps = computed(() => {
  return (
    store.getPoints.find(
      (point) =>
        point.beatOrderIndex === props.beatOrderIndex &&
        point.barOrderIndex === props.orderIndex
    ) || {}
  );
});

const currentDuration = computed(() => props.beat?.duration?.name);

function updateSvgComponent() {
  if (!currentDuration.value) return;

  switch (currentDuration.value) {
    case "WHOLE":
      SvgComponent.value = null;
      break;
    case "HALF":
      SvgComponent.value = markRaw(Half);
      break;
    case "QUARTER":
      SvgComponent.value = markRaw(Quarter);
      break;
    case "EIGHTH":
      SvgComponent.value = markRaw(Eigth);
      break;
    case "SIXTEENTH":
      SvgComponent.value = markRaw(Sixteenth);
      break;
    case "THIRTY_SECOND":
      SvgComponent.value = markRaw(ThirtySeconds);
      break;
    case "SIXTY_FOUR":
      SvgComponent.value = markRaw(SixtyFour);
      break;
  }
}

watch(currentDuration, () => {
  updateSvgComponent();
});

watch(
  () => store.getPoints,
  () => {
    updateSvgComponent();
  },
  { deep: true }
);

eventBus.on("upd-beat", () => {
  store.checkAllDurations();
  updateSvgComponent();
});
</script>

<template lang="pug">
div.beat-wrapper(@mouseenter="onMouseEnter" @mouseleave="onMouseLeave" style="position: relative;")
  div.transparent-overlay
    DeleteBeat.delete-beat(v-if="showDeleteIcon" :barOrderIndex="props.orderIndex" :beatOrderIndex="props.beatOrderIndex")
  div.beat
    NoteList(:beat="props.beat" :orderIndex="props.orderIndex" :barId="props.barId" :beatId="props?.beatId" :beatOrderIndex="props.beatOrderIndex")
  div
    TrashIcon.add-button.logo(ref="buttonRef" @click="togglePanel" v-if="isHovered" viewBox="0 0 24 24" width="24" height="24") 
    div.popup-panel(v-if="showPanel" ref="panelRef")
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
  background: transparent;
  z-index: -1;
  justify-content: center;
  display: flex;
}
.delete-beat {
  position: absolute;
  cursor: pointer;
  z-index: 5;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
.delete-beat:hover {
  opacity: 1;
}
.eigth-svg {
  position: absolute;
  top: 110%;
  left: 47%;
  transform: translateX(-50%);
  margin-top: 5px;
  pointer-events: none;
  z-index: 1;
}
.beat-wrapper {
  position: relative;
  overflow: visible;
}
.add-button {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  cursor: pointer;
  padding: 10px 8px;
  border: none;
  color: #000;
}
.add-button:hover {
  color: rgb(111, 0, 255);
  filter: drop-shadow(0 0 1px rgba(255, 0, 0, 0.3));
  transition: opacity 0.3s ease, filter 0.3s ease;
}
.add-button:active {
  color: #b83030;
}
.beat {
  position: relative;
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
  bottom: 0px;
  left: 60px;
  width: 100px;
  height: 200px;
  padding: 10px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 500;
}
</style>
