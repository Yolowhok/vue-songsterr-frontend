<script setup>
import { computed } from "vue";
import { useCompositionStore } from "@/entities/composition";
import Bar from "./Bar.vue";
import PlayheadLine from "./PlayheadLine.vue";

const store = useCompositionStore();

const bars = computed(
  () => store.getComposition?.notesheets[store.getChosenNotesheet]?.bars
);

const orientation = computed(() => store.settings.orientation);
</script>

<template lang="pug">
div.bar-list-root
  section
    .flex-container(:style="{ 'flex-wrap': orientation }")
      template(v-if="bars && bars.length")
        div.forBar(v-for="(bar, index) in bars" :key="bar.orderIndex")
          Bar(:bar="bar" :orderIndex="bar.orderIndex")
  PlayheadLine
</template>

<style>
.bar-list-root {
  position: relative;
  width: 100%;
  min-height: 50vh;
}
.flex-container {
  align-items: center;
  position: absolute;
  padding-left: 100px;
  padding-right: 100px;
  display: flex;
  justify-content: flex-start;
}

.forBar {
  padding: 0;
  margin: 0;
}
</style>
