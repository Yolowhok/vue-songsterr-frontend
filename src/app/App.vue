<script setup>
import { onBeforeMount } from "vue";
import { useCompositionStore } from "@/entities/composition";

const store = useCompositionStore();
onBeforeMount(async () => {
  await store.fetchCompositionList();
  await store.fetchDuration();
  store.fetchTimeSignatures();
  store.fetchTuningList();
  store.fetchInstruments();
});
</script>

<template lang="pug">
router-view
</template>

<style>
:root {
  --header-height: 0px;
}
body {
  margin: 0;
  padding: 0;
}
</style>
