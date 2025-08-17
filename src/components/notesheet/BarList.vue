<script setup>
import { onMounted, watch, onUpdated, computed, nextTick } from "vue";
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
</script>

<template lang="pug">
    div
      section
          .flex-container(:style="{ 'flex-wrap': orientation }")
            template(v-if="bars && bars.length")
              div.forBar(v-for="(bar, index) in bars")
                Bar(:bar="bar" :id="bar.id" :orderIndex="bar.orderIndex")




</template>

<style>
.flex-container {
  align-items: center;
  position: absolute;
  padding-left: 100px;
  padding-right: 100px;
  display: flex;
  justify-content: center;
}

.forBar {
  padding: 0;
  margin: 0;
}
</style>
