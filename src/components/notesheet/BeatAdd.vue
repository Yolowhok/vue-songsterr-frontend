<script setup>
import BeatAdd from "../../assets/BeatAdd.svg"; // или '../assets/logo.svg' в зависимости от структуры
import { useMyStore } from "../../store/notesheet-store";
import { newStore } from "../../store/notesheet-store";
import { defineProps, watch } from "vue";
import eventBus from "../../eventBus";
const store = newStore();

const props = defineProps({
  beatOrderIndex: {
    type: Number,
  },
  barOrderIndex: {
    type: Number,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

// const store = useMyStore();
const addBeat = () => {
  store.addBeat(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
};
// watch(
//   // () => store.notesheets.notesheets[store.notesheetChoise].bars,
//   (newVal, oldVal) => {
//     // console.log("notesheets изменились", newVal);
//   }
// );
</script>

<template lang="pug">
  div.beat(:class="{ visible: visible }")
    BeatAdd( alt="Логотип" @click="addBeat()").logo
    //- img(:src="BeatAdd" alt="Логотип" @click="addBeat()").logo


</template>

<style scoped>
.logo {
  width: 100%;
  height: 100%; /* добавьте высоту, чтобы SVG полностью заполнил контейнер */
  opacity: 0;
  /* Изначально скрываем */
  transition: opacity 0.3s ease, box-shadow 0.3s ease; /* Плавное появление и переход для обводки */
  cursor: pointer;
}

.beat.visible .logo {
  opacity: 1;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  transition: opacity 0.3s ease, filter 0.3s ease;
  color: black;
}
.beat .logo {
  opacity: 0;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  transition: opacity 0.5s ease, 0.5s ease;
  /* color: #007bff; */

  color: rgb(131, 38, 251);
  /* rgb(111, 0, 255); */
}
.beat:hover .logo {
  opacity: 1;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.beat {
  width: 30px;
  height: 115%;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  align-items: center;
  justify-content: left;
  flex-direction: row;
}
</style>
