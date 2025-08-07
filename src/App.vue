<script setup>
import General from "./components/General.vue";
import { onBeforeMount } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
import { newStore } from "./store/notesheet-store";

const store = newStore();
onBeforeMount(async () => {
  console.log("APP");

  // await store.fetchNoteOctaveOrdered();

  // await store.fetchCompositionList();
  // await store.fetchDuration();
  // console.log("route.params.num", route.params.num);

  // if (route.params.num) {
  //   console.log(route.params.num);
  // }
  // console.log("APP");
  console.log("store.getDuration", store.getDuration);
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
