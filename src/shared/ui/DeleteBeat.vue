<script setup>
import { defineProps, computed } from "vue";
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

const props = defineProps({
  barOrderIndex: Number,
  beatOrderIndex: Number,
});

const store = useCompositionStore();

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
