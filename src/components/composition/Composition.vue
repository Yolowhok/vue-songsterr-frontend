<script setup>
import { onMounted, onBeforeMount, ref } from "vue";
import { newStore } from "../../store/notesheet-store";
import { useRoute } from "vue-router";
import CompositionHeader from "./CompositionHeader.vue";
import CompositionBody from "./CompositionBody.vue";
import { nextTick } from "vue";
import { useRouter } from "vue-router";
const route = useRoute();
const store = newStore();
const router = useRouter();

const isLoading = ref(true);

onMounted(async () => {
  store.setChosenNotesheet(route.params.num);

  if (store.getCachedComposition?.id == route.params.id) {
    store.setFretboard();
    store.setChosenComposition(store.getCompositionById(route.params.id));

    store.fetchComposition(route.params.id);
    store.setCacheComposition(store.getComposition);
    isLoading.value = false;
    console.log(store.getComposition);
  } else {
    try {
      await store.fetchComposition(route.params.id);
      await store.fetchNoteOctaveOrdered();

      store.setFretboard();
      store.setChosenComposition(store.getCompositionById(route.params.id));

      store.setCacheComposition(store.getComposition);
      console.log(store.getComposition);
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      isLoading.value = false;
      await router.push("/");
    }
  }
});
</script>
<template lang="pug">
div.container
  template(v-if="isLoading")
    .skeleton-body
      .skeleton-row(v-for="i in 1" :key="i")
  template(v-else)
    CompositionHeader.compositionHeader
  template(v-if="isLoading")
    .skeleton-body.compositionBody
      .skeleton-row(v-for="i in 10" :key="i")

  template(v-else)
    CompositionBody.compositionBody
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
}
.compositionHeader {
  width: 100%;
  height: 20%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-top: 5%;
}
.compositionBody {
  height: 100%;
  min-height: 50vh;
  width: 100%;
}
.skeleton {
  padding-top: 5%;
}
.skeleton-header {
  width: 80%;
  gap: 1rem;
  height: 37%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.skeleton-title {
  height: 6rem;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer-2c312e49 1.5s infinite;
}
.skeleton-subtitle {
  height: 5.5rem;
  width: 40%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer-2c312e49 1.5s infinite;
}
.skeleton-body {
  width: 80%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.skeleton-row {
  height: 15rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
