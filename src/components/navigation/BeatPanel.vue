<!-- <script setup>
import { defineProps, computed } from "vue";
import { useMyStore } from "../../store/notesheet-store";
import Ronde from "../../assets/Ronde.svg"; // или '../assets/logo.svg' в зависимости от структуры

const storePinia = useMyStore();

function addBarRight() {
  console.log("da");
}
</script>

<template lang="pug">
    div.panel
        button(@click="addBarRight()") |>
        button(@click="addBarLeft()") +|
        button(@click="deleteBar()") -
        Ronde


</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style> -->

<!-- <script setup>
import { defineProps, computed } from "vue";
import { useMyStore } from "../../store/notesheet-store";
import Ronde from "../../assets/Ronde.svg"; // или '../assets/logo.svg' в зависимости от структуры
import Half from "../../assets/half.svg"; // или '../assets/logo.svg' в зависимости от структуры

const storePinia = useMyStore();

function addBarRight() {
  console.log("da");
}
</script>

<template lang="pug">
  div.panel
    div.item-container.svg-container
        Half(viewBox="0 0 50 50" width="20" height="20")
        //(style="width: 16px; height: 16px;" viewBox="0 0 50 50")
    div.item-container.svg-container
        Ronde
    div.item-container.svg-container
        Ronde
    div.item-container.svg-container
        Ronde
    div.item-container.svg-container
        Ronde
    div.item-container.svg-container
        Ronde
    div.item-container.svg-container
        Ronde
    div.item-container.svg-container
        Ronde
</template>

<style scoped>
.panel {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  /* height: 100%; */ /* убрать или заменить на auto */
  height: auto;
  background-color: wheat;
  justify-content: flex-start;
  align-content: flex-start;
}

.item-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.svg-container {
  /* При необходимости дополнительные стили для SVG контейнера */
}
</style> -->

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
  console.log(
    "props.barOrderIndex, props.beatOrderIndex, name",
    props.barOrderIndex,
    props.beatOrderIndex,
    name
  );
  store.setDurationForBeat(props.barOrderIndex, props.beatOrderIndex, name);
  // eventBus.emit("update-all-beats");
}
function deleteBeat() {
  console.log("DELETE");
  console.log(
    "props.barOrderIndex, props.beatOrderIndex",
    props.barOrderIndex,
    props.beatOrderIndex
  );
  store.deleteBeat(props.barOrderIndex, props.beatOrderIndex);

  // eventBus.emit("update-all-beats");
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
  /* Убедимся, что переход применяется и по умолчанию */
  transition: opacity 0.3s ease, filter 0.3s ease;
}

/* Для Ronde: центр по горизонтали, внизу по вертикали */
.item-container.svg-container:not(.svg-container-half) {
  justify-content: center;
  align-items: flex-end;
}

/* Для Half: центр по горизонтали и по вертикали */
.item-container.svg-container.svg-container-half {
  justify-content: center;
  align-items: center;
  /* justify-content: center; */
  /* align-items: flex-end; */
}

.svg-container-quareter {
  justify-content: center;
  align-items: flex-end;
}
.item-container.svg-container.svg-container-ThirtySecond {
  justify-content: center;
  align-items: center;
}

/* Подсветка svg при наведении на контейнер */
.item-container.svg-container:hover {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  cursor: pointer; /* по желанию */
}
</style>
