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

function deleteBeat() {
  store.deleteBeat(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
}
</script>

<template lang="pug">
div.icon-container(@click="deleteBeat")
  span.material-icons close
</template>

<style scoped>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons");

.icon-container {
  cursor: pointer;
  position: relative;
  top: 15%;
}
.material-icons {
  font-family: "Material Icons";
  font-size: 24px;
  color: #333;
  transition: color 0.2s ease;
}
.icon-container:hover .material-icons {
  color: #f44336;
}
</style>
