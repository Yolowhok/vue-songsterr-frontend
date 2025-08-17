<script setup lang="js">
import { ref, onMounted, reactive, defineProps, computed, watch, watchEffect, onUnmounted } from "vue";
import Lines from "./Lines.vue";
import Beat from "./Beat.vue";
import BeatList from "./BeatList.vue";
import BarPanel from "../navigation/BarPanel.vue";
import { useMyStore } from "../../store/notesheet-store";
import TrashIcon from "../../assets/dots.svg"; // или '../assets/logo.svg' в зависимости от структуры
import Eigth from "../SvgComponents/Eigth.vue";
import BarSize from "../SvgComponents/BarSize.vue";
import BarSizePanel from "../navigation/BarSizePanel.vue";
import BarSizeNew from "../SvgComponents/BarSizeNew.vue";
import { newStore } from "../../store/notesheet-store";
import eventBus from "../../eventBus";

const height = ref(150);
const props = defineProps({
  bar: {
    type: Object,
  },
  orderIndex: {
    type: Number,
  }
});

const store = newStore()
const bar = computed(() => props.bar || []);
const showPanel = ref(false);
const showBarSizePanel = ref(false);

const width = computed(() => {
  const beatsCount = props.bar?.beats?.length || 1;
  return (beatsCount+2) * 90 ;
});

watch(
  bar,
  (newVal) => {
    if (newVal) {
    }
  }
);


function togglePanel() {
  eventBus.emit("close-all-beat-panels");
  showPanel.value = !showPanel.value;
}

function toggleBarSizePanel() {
  showBarSizePanel.value = !showBarSizePanel.value;
}
function closePanel() {
  showPanel.value = false
}
const showBarSize = computed(() => {
  const bars = store.getComposition.notesheets[store.getChosenNotesheet].bars
  const currentOrderIndex = props.orderIndex

  if (currentOrderIndex == 0) return true

  const prevBar = bars.find(b => b.orderIndex === currentOrderIndex - 1)

  if (!prevBar) return true

  const currTS = props.bar?.timeSignature || {}
  const prevTS = prevBar?.timeSignature || {}
  return currTS.upper != prevTS.upper || currTS.lower != prevTS.lower
})
function closeBarSizePanel() {
  showBarSizePanel.value = false
}
onMounted(() => {
  window.addEventListener("click", handleClickOutside)
  eventBus.on("close-bar-panels", closePanel);
  eventBus.on("close-bar-size-panel", closeBarSizePanel)

})
onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside)
  eventBus.off("close-bar-panels", closePanel);
  eventBus.off("close-bar-size-panel", closeBarSizePanel);


})

const popupPanelRef = ref(null);
const pupupBarSizePanelRef = ref(null)
const handleClickOutside = (event) => {
  if (popupPanelRef.value && !popupPanelRef.value.contains(event.target)) {
    showPanel.value = false;
  }
  if (pupupBarSizePanelRef.value && !pupupBarSizePanelRef.value.contains(event.target)) {
  showBarSizePanel.value = false

  }
};
</script>

<template lang="pug">
    div.bar(:style="{ width: width + 'px'}"  )
        div.annotation()
          div(ref="pupupBarSizePanelRef")
            BarSizeNew(v-if="!showBarSize && store.getEditModeStatus" @click="toggleBarSizePanel")
            BarSize(v-if="showBarSize" :bar="props.bar" @click="toggleBarSizePanel"  )
            div.popup-panel-bar-size(v-if="showBarSizePanel && store.getEditModeStatus")
              BarSizePanel( :bar="props.bar")
        div.lines
            div.value
                BeatList(:beats="bar.beats" :orderIndex = "props.orderIndex" :barId="props.bar?.id" :timeSignature="props?.bar?.timeSignature")
            Lines.lines-content
        div.duration() 
          div.three-dots( v-if="store.getEditModeStatus" ref="popupPanelRef")
            TrashIcon.button.logo(@click="togglePanel") .
            div.popup-panel(v-if="showPanel")
              BarPanel(:bar="bar" :index="bar.value?.orderIndex" )


</template>

<style scoped>
.bar {
  position: relative;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: 0;
}
.annotation {
  height: 30%;
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-start;
}
.duration {
  height: 30%;
}
.button {
  display: flex;
  flex-direction: row-reverse;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.logo:hover {
  color: rgb(111, 0, 255);
}
.button:hover {
  transition: opacity 0.3s ease, filter 0.3s ease;
}
.bar:hover .button {
  opacity: 1;
  pointer-events: auto;
  cursor: pointer;
}
.three-dots {
  display: flex;
  flex-direction: row-reverse;
}
.lines {
  width: 100%;
  height: 40%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.value {
  position: absolute;
  height: 80%;
  width: 100%;
  z-index: 1;
}
.lines-content {
  height: 80%;
}
.popup-panel {
  position: absolute;
  right: 0;
  bottom: 0;
  top: 60%;
  left: 80%;
  align-items: center;
  width: 150px;
  height: 10%;
  z-index: 10;
  border-radius: 4px;
}
.popup-panel-bar-size {
  position: absolute;
  bottom: 0px;
  right: 0;
  top: 100px;
  left: 50px;
  width: 100px;
  height: 110px;
  padding: 10px;
  background: white;
  border: 1px solid #ccc;
  z-index: 10;
  border-radius: 4px;
}
</style>
