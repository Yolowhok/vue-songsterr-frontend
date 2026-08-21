<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useCompositionStore } from "@/entities/composition";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import CompositionHeader from "@/widgets/composition-header/ui/CompositionHeader.vue";
import CompositionBody from "@/widgets/composition-header/ui/CompositionBody.vue";
import { bindEditorHistoryHotkeys } from "@/features/editor-history";
import { bindEditorNavigationHotkeys } from "@/features/editor-navigation";
import { bindEditorPlaybackHotkeys } from "@/features/editor-playback";

const route = useRoute();
const store = useCompositionStore();
const router = useRouter();

const isLoading = ref(true);
let unbindHotkeys = null;
let unbindNavHotkeys = null;
let unbindPlaybackHotkeys = null;

const onBeforeUnload = (event) => {
  if (!store.isDirty) return;
  event.preventDefault();
  event.returnValue = "";
};

onBeforeRouteLeave((_to, _from, next) => {
  if (!store.isDirty) {
    next();
    return;
  }
  const ok = window.confirm(
    "Есть несохранённые изменения. Уйти со страницы?"
  );
  next(ok);
});

onMounted(async () => {
  unbindHotkeys = bindEditorHistoryHotkeys();
  unbindNavHotkeys = bindEditorNavigationHotkeys();
  unbindPlaybackHotkeys = bindEditorPlaybackHotkeys();
  window.addEventListener("beforeunload", onBeforeUnload);
  store.setChosenNotesheet(route.params.num);

  if (store.getCachedComposition?.id == route.params.id) {
    store.setFretboard();
    store.setChosenComposition(store.getCompositionById(route.params.id));

    store.fetchComposition(route.params.id);
    store.setCacheComposition(store.getComposition);
    isLoading.value = false;
  } else {
    try {
      await store.fetchComposition(route.params.id);
      await store.fetchNoteOctaveOrdered();

      store.setFretboard();
      store.setChosenComposition(store.getCompositionById(route.params.id));

      store.setCacheComposition(store.getComposition);
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

onUnmounted(() => {
  if (unbindHotkeys) unbindHotkeys();
  if (unbindNavHotkeys) unbindNavHotkeys();
  if (unbindPlaybackHotkeys) unbindPlaybackHotkeys();
  window.removeEventListener("beforeunload", onBeforeUnload);
  store.pausePlayback();
  store.flushAutosaveTimer();
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
