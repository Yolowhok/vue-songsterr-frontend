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
import BeatPanel from "@/widgets/editor-chrome/ui/BeatPanel.vue";
import TrashIcon from "@/shared/assets/menuLines.svg";
import Eigth from "@/shared/ui/Eigth.vue";
import Quarter from "@/shared/ui/Quart.vue";
import { computed } from "vue";
import Sixteenth from "@/shared/ui/Sixteenth.vue";
import ThirtySeconds from "@/shared/ui/ThirtySeconds.vue";
import Half from "@/shared/ui/Half.vue";
import SixtyFour from "@/shared/ui/SixtyFour.vue";
import { watch } from "vue";
import eventBus from "@/shared/lib/eventBus";
import { useCompositionStore } from "@/entities/composition";
import DeleteBeat from "@/shared/ui/DeleteBeat.vue";

const store = useCompositionStore();
const props = defineProps({
  beat: Object,
  orderIndex: Number,
  barId: Number,
  beatId: Number,
  beatOrderIndex: Number,
  points: Object,
});


const isHovered = ref(false);
const showPanel = ref(false);
const showDeleteIcon = ref(false);

const panelRef = ref(null);
const buttonRef = ref(null);

const closeAllPanels = () => {
  showPanel.value = false;
};

function openPanelFromKeyboard(payload) {
  if (
    payload?.barOrder !== props.orderIndex ||
    payload?.beatOrder !== props.beatOrderIndex
  ) {
    return;
  }
  eventBus.emit("close-all-beat-panels");
  eventBus.emit("close-bar-panels");
  eventBus.emit("close-bar-size-panel");
  showPanel.value = true;
}

onMounted(() => {
  eventBus.on("close-all-beat-panels", closeAllPanels);
  eventBus.on("open-beat-panel", openPanelFromKeyboard);
  document.addEventListener("click", handleClickOutside);
  updateSvgComponent();
});

onUnmounted(() => {
  eventBus.off("close-all-beat-panels", closeAllPanels);
  eventBus.off("open-beat-panel", openPanelFromKeyboard);
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

function onBeatSeek(event) {
  if (store.getEditModeStatus) return;
  if (
    event.target.closest?.(
      ".delete-beat, .add-button, .popup-panel, .beat-popup-panel, .overlay-input, .playhead-line"
    )
  ) {
    return;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const progress =
    rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
  store.seekPlayback(
    props.orderIndex,
    props.beatOrderIndex,
    Math.min(1, Math.max(0, progress))
  );
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

const isPlayheadBeat = computed(() => {
  if (store.getEditModeStatus) return false;
  const ph = store.playhead;
  return (
    !!ph &&
    ph.barOrder === props.orderIndex &&
    ph.beatOrder === props.beatOrderIndex
  );
});

const isDotted = computed(() => Boolean(props.beat?.dotted));
const isRest = computed(() => Boolean(props.beat?.rest));
const isTuplet = computed(
  () => props.beat?.tupletNum === 3 && props.beat?.tupletDen === 2
);

/** First of a consecutive same-tuplet run in this bar → draw bracket start. */
const tupletBracketStart = computed(() => {
  if (!isTuplet.value) return false;
  const ns = store.getComposition?.notesheets?.[store.getChosenNotesheet];
  const bar = ns?.bars?.find((b) => b.orderIndex === props.orderIndex);
  if (!bar?.beats?.length) return true;
  const sorted = [...bar.beats].sort((a, b) => a.orderIndex - b.orderIndex);
  const idx = sorted.findIndex((b) => b.orderIndex === props.beatOrderIndex);
  if (idx <= 0) return true;
  const prev = sorted[idx - 1];
  return !(prev.tupletNum === 3 && prev.tupletDen === 2);
});

const tupletRunLength = computed(() => {
  if (!tupletBracketStart.value) return 1;
  const ns = store.getComposition?.notesheets?.[store.getChosenNotesheet];
  const bar = ns?.bars?.find((b) => b.orderIndex === props.orderIndex);
  if (!bar?.beats?.length) return 1;
  const sorted = [...bar.beats].sort((a, b) => a.orderIndex - b.orderIndex);
  const idx = sorted.findIndex((b) => b.orderIndex === props.beatOrderIndex);
  let n = 0;
  for (let i = idx; i < sorted.length; i++) {
    if (sorted[i].tupletNum === 3 && sorted[i].tupletDen === 2) n++;
    else break;
  }
  return Math.max(1, n);
});

/** Bracket spans centers of first…last digit (beat = 90px, digit center = 45px). */
const tupletBracketStyle = computed(() => {
  const n = tupletRunLength.value;
  if (n <= 1) {
    return { left: "35px", width: "20px" };
  }
  return { left: "45px", width: `${(n - 1) * 90}px` };
});

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
div.beat-wrapper(
  @mouseenter="onMouseEnter"
  @mouseleave="onMouseLeave"
  @click="onBeatSeek"
  style="position: relative;"
  :data-playhead-beat="`${props.orderIndex}-${props.beatOrderIndex}`"
  :class="{ 'playhead-active': isPlayheadBeat, 'is-rest': isRest, 'is-tuplet': isTuplet }"
)
  div.transparent-overlay
    DeleteBeat.delete-beat(v-if="showDeleteIcon && store.getEditModeStatus" :barOrderIndex="props.orderIndex" :beatOrderIndex="props.beatOrderIndex")
  div.tuplet-bracket(
    v-if="tupletBracketStart"
    :style="tupletBracketStyle"
  )
    span.tuplet-num 3
  div.beat
    NoteList(
      v-if="!isRest"
      :beat="props.beat"
      :orderIndex="props.orderIndex"
      :barId="props.barId"
      :beatId="props?.beatId"
      :beatOrderIndex="props.beatOrderIndex"
    )
    div.rest-mark(v-else) 𝄽
  div
    TrashIcon.add-button.logo(ref="buttonRef" @click="togglePanel" v-if="isHovered && store.getEditModeStatus" viewBox="0 0 24 24" width="24" height="24")
    div.popup-panel.beat-popup-panel(v-if="showPanel" ref="panelRef")
      BeatPanel(:barOrderIndex="props.orderIndex" :beatOrderIndex="props.beatOrderIndex")
  component.eigth-svg(v-if="SvgComponent && !isRest" :is="SvgComponent" :points="svgProps")
  span.dotted-dot(v-if="isDotted && !isRest" aria-hidden="true")
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
.playhead-active .beat {
  background: rgba(131, 38, 251, 0.08);
  border-radius: 4px;
}
.popup-panel {
  position: absolute;
  bottom: 0px;
  left: 60px;
  width: 160px;
  min-height: 200px;
  padding: 10px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 500;
}
.dotted-dot {
  position: absolute;
  top: calc(110% + 48px);
  left: calc(47% + 14px);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #222;
  pointer-events: none;
  z-index: 2;
}
.rest-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 28px;
  color: #333;
  pointer-events: none;
}
.tuplet-bracket {
  position: absolute;
  top: -18px;
  height: 14px;
  border-top: 2px solid #333;
  border-left: 2px solid #333;
  border-right: 2px solid #333;
  pointer-events: none;
  z-index: 3;
  box-sizing: border-box;
}
.tuplet-num {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 700;
  background: #fff;
  padding: 0 4px;
  color: #333;
}
</style>
