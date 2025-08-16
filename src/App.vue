<script setup>
import General from "./components/General.vue";
import { onBeforeMount } from "vue";

import { newStore } from "./store/notesheet-store";

const store = newStore();
onBeforeMount(async () => {
  await store.fetchCompositionList();
  await store.fetchDuration();
  store.fetchTimeSignatures();
  store.fetchTuningList();
});
</script>

<template lang="pug">
    router-view
</template>

<style>
:root {
  --header-height: 0px; /* Будет обновляться динамически */
}

body {
  margin: 0;
  padding: 0;
}
</style>
