<script setup>
import { defineProps, computed } from "vue";
import { useMyStore } from "../../store/notesheet-store";
import BarRight from "../../assets/BarLeft.svg";
import BarLeft from "../../assets/BarRight.svg";
import Delete from "../../assets/Delete.svg";

const storePinia = useMyStore();
const props = defineProps({
  bar: {
    type: Object,
  },
  index: {
    type: Number,
  },
});
const bar = computed(() => props.bar);

function addBarLeft() {}
function addBarRight() {
  storePinia.fetchAddBarRigth(0, bar.value?.orderIndex);
  console.log(storePinia.notesheets.notesheets[storePinia.notesheetChoise]);
}

function deleteBar() {
  storePinia.fetchDeleteBar(0, bar.value?.orderIndex);
}
</script>

<template lang="pug">
    //- | Здесь будет ваша всплывающая панель
    //- div.panel
    //-     button(@click="addBarRight()") |>
    //-     button(@click="addBarLeft()") +|
    //-     button(@click="deleteBar()") -
    //-     BarLeft
    //-     BarRight

    div.panel
      div.item-container.svg-container
        BarRight
      div.item-container.svg-container
        BarLeft(@click="addBarRight")

      div.item-container.svg-container.trash
        Delete.trash(@click="deleteBar")


</template>

<style scoped>
/* .panel {
  display: flex;
  flex-direction: row;
  gap: 10px;
} */

.panel {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  height: auto;
  justify-content: flex-start;
  align-content: flex-start;
  z-index: 500;
}

.trash:hover {
  color: #e63f3f;
  filter: drop-shadow(0 0 1px rgba(255, 0, 0, 0.338));
  transition: opacity 0.3s ease, filter 0.3s ease;
}
.item-container {
  display: flex;
  width: 30px;
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
