<script setup>
import { defineProps, computed } from "vue";
import { useMyStore } from "../../store/notesheet-store";
import Ronde from "../../assets/Ronde.svg";
import Quarter from "../../assets/QUARTER.svg";
import Half from "../../assets/half.svg";
import Eighth from "../../assets/EIGHTH.svg";
import Sixteenth from "../../assets/SIXTEENTH.svg";
import ThirtySecond from "../../assets/THIRTY_SECOND.svg";
import SixtyFour from "../../assets/SIXTY_FOUR.svg";
import trash from "../../assets/trash1.svg";
import eventBus from "../../eventBus";
import { newStore } from "../../store/notesheet-store";

const props = defineProps({
  barOrderIndex: Number,
  beatOrderIndex: Number,
});

const storePinia = useMyStore();
const store = newStore();

function addBarRight() {
  console.log("da");
}

function onClick(name) {
  console.log("click for upd duration for beat");

  store.updateDurationForBeat(props.barOrderIndex, props.beatOrderIndex, name);
  eventBus.emit("upd-beat");
  eventBus.emit("close-all-beat-panels");
}
function deleteBeat() {
  console.log("click for delete beat");
  eventBus.emit("close-all-beat-panels");

  store.deleteBeat(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
}
</script>

<template lang="pug">
  div.panel
    div.item-container.svg-container(@click="onClick('WHOLE')")
      Ronde
    div.item-container.svg-container.svg-container-quareter(@click="onClick('HALF')")
      Half(viewBox="0 -0.5 1.6343 4.132")
    div.item-container.svg-container.svg-container-half(@click="onClick('QUARTER')")
      Quarter(viewBox="0 0 25 30")
    div.item-container.svg-container(@click="onClick('EIGHTH')")
      Eighth
    div.item-container.svg-container.svg-container-quareter(@click="onClick('SIXTEENTH')")
      Sixteenth(viewBox="0 0 30 30")
    div.item-container.svg-container.svg-container-ThirtySecond(@click="onClick('THIRTY_SECOND')")
      ThirtySecond(viewBox="-10 15 40 40")
    div.item-container.svg-container.svg-container-ThirtySecond(@click="onClick('SIXTY_FOUR')")
      SixtyFour(viewBox="-10 15 40 40")
    div.item-container.svg-container.trash(@click="deleteBeat")
        trash.trash(viewBox="0 0 25 30")

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
</style>
