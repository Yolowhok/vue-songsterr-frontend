<script setup lang="js">
import { ref, onMounted, reactive, defineProps, computed, watch, watchEffect } from "vue";
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
const height = ref(150);
const props = defineProps({
  bar: {
    type: Object,
  },
  orderIndex: {
    type: Number,
  }
});



//- BeatList(:beats="bar.beats" :orderIndex = "props.orderIndex" :barId="props.bar?.id")

const oldStore = useMyStore();

// watch(
//   () => store.notesheets.notesheets[store.notesheetChoise].bars,

// );


const bar = computed(() => props.bar || []);
const orderIndex = computed(() => props.orderIndex)

const width = computed(() => {
  const beatsCount = props.bar?.beats?.length || 1;
  return (beatsCount+2) * 90 ; // вместо 100 можно использовать любое базовое значение ширины одного битa
});


const showPanel = ref(false);
const showBarSizePanel = ref(false);

function togglePanel() {
  showPanel.value = !showPanel.value;
}
function onMouseLeave() {
  showPanel.value = false; // скрываем панель при уходе курсора
}
function toggleBarSizePanel() {
  showBarSizePanel.value = !showBarSizePanel.value;

}
function onMouseLeaveBarSize() {
  showBarSizePanel.value = false;
}

const showBarSize = computed(() => {
  // console.log(props.bar)
  // const bars = store.notesheets.notesheets[store.notesheetChoise].bars
  // const currentOrderIndex = props.orderIndex

  // if (currentOrderIndex == 0) return true // первый бар — показать

  // // Найти предыдущий бар с orderIndex на 1 меньше
  // const prevBar = bars.find(b => b.orderIndex === currentOrderIndex - 1)

  // if (!prevBar) return true // если нет предыдущего, показать

  // const currTS = props.bar?.timeSignature || {}
  // const prevTS = prevBar?.timeSignature || {}
  // // console.log(currentOrderIndex, currTS, prevTS)
  // console.log(props.bar)
  // return currTS.upper != prevTS.upper || currTS.lower != prevTS.lower
})
</script>

<template lang="pug">
    div.bar(:style="{ width: width + 'px'}"   )
        div.annotation(@mouseleave="onMouseLeaveBarSize")
          //- BarSizeNew(v-if="!showBarSize" @click="toggleBarSizePanel")
          
          //- BarSize(v-if="showBarSize" :bar="props.bar" @click="toggleBarSizePanel")
          //- div.popup-panel-bar-size(v-if="showBarSizePanel" @mouseleave="onMouseLeaveBarSize")
          //-   BarSizePanel( :bar="props.bar")


        div.lines
            div.value
                BeatList(:beats="bar.beats" :orderIndex = "props.orderIndex" :barId="props.bar?.id")
            Lines.lines-content

        div.duration(@mouseleave="onMouseLeave") 
          //- div.button
          //-   TrashIcon.button.logo(@click="togglePanel") .
          //-   div.popup-panel(v-if="showPanel")
          //-     BarPanel(:bar="bar" :index="bar.value?.orderIndex" )


</template>

<style scoped>
.bar {
  position: relative; /* Устанавливаем относительное позиционирование для контейнера */
  /* width: 300px; */
  height: 500px;
  /* height: 400px; */
  display: flex; /* Если нужно выровнять элементы внутри */
  /* justify-content: center; Центрируем элементы внутри по горизонтали */
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
  /* z-index: 5; */
  display: flex;
  flex-direction: row-reverse;
  opacity: 0;
  pointer-events: none; /* кнопка не кликабельна, пока скрыта */
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
  pointer-events: auto; /* включаем клики */
  cursor: pointer;
}

.lines {
  width: 100%;
  height: 40%;
  position: relative;
  display: flex;
  align-items: center; /* Центрируем элементы внутри по вертикали */
  justify-content: center; /* Центрируем элементы внутри по горизонтали */
}
.value {
  position: absolute;
  height: 80%;
  width: 100%;
  z-index: 1; /* Обеспечивает наложение поверх lines */
}
.lines-content {
  height: 80%;
}

.popup-panel {
  position: absolute;
  bottom: 50px; /* чуть выше кнопки */
  right: 0;
  width: 150px;
  height: 100px;
  padding: 10px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  border-radius: 4px;
}
.popup-panel-bar-size {
  position: absolute;
  bottom: 0px; /* чуть выше кнопки */
  right: 0;
  top: 100px;
  left: 50px;
  width: 100px;
  height: 110px;
  padding: 10px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  border-radius: 4px;
}
</style>
