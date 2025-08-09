<script setup>
import General from "./components/General.vue";
import { onBeforeMount } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
import { newStore } from "./store/notesheet-store";

const store = newStore();
onBeforeMount(async () => {
  await store.fetchCompositionList();
  await store.fetchTimeSignatures();
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
