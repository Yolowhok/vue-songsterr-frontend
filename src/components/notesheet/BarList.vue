<script setup>
import { onMounted, watch, onUpdated, computed } from "vue";
import { useMyStore } from "../../store/notesheet-store";
import { newStore } from "../../store/notesheet-store";
import Bar from "./Bar.vue";
const store = newStore();

const bars = computed(
  () => store.getComposition?.notesheets[store.getChosenNotesheet]?.bars
);

`position: absolute;
    padding-left: 100px;`;

const orientation = computed(() => store.settings.orientation);
// const bars = computed(() => store)

// const oldStore = useMyStore();
// const bars = computed(() => {
//   if (!oldStore.notesheets.notesheets || oldStore.notesheetChoise < 0)
//     return null;
//   return oldStore.notesheets.notesheets[oldStore.notesheetChoise]?.bars || null;
// });

// watch(
//   () => oldStore.notesheets,
//   () => {},
//   { deep: true }
// );
// const isBarsEmpty = computed(() => !bars.value || bars.value.length === 0);
// watch(
//   isBarsEmpty,
//   (empty) => {
//     if (empty) {
//       oldStore.fetchAddBarRigthInEmpty(); // вызов функции из store при пустом bars
//     }
//   },
//   { immediate: true }
// );
</script>

<template lang="pug">
    div
      section
          .flex-container(:style="{ 'flex-wrap': orientation }")
            template(v-if="bars && bars.length")
              div.forBar(v-for="(bar, index) in bars")
                Bar(:bar="bar" :id="bar.id" :orderIndex="bar.orderIndex")
              


      //- section(v-if="bars && bars.length")
      //-     .flex-container
      //-       template(v-if="bars && bars.length")
      //-         div.forBar(v-for="(bar, index) in bars")
      //-           Bar(:bar="bar" :id="bar.id" :orderIndex="bar.orderIndex")





</template>

<style>
.flex-container {
  align-items: center;
  /* width: 80%; */
  position: absolute;
  padding-left: 100px;
  padding-right: 100px;

  display: flex; /* Используем flexbox для расположения элементов в строку */
  justify-content: center;
  /* Центрируем элементы внутри по горизонтали */
}

.forBar {
  padding: 0;
  margin: 0;
}
</style>
