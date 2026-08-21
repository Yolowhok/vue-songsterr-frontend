<script setup>
import { onMounted, onUnmounted } from "vue";
import BarList from "./BarList.vue";
import { useCompositionStore } from "@/entities/composition";

const store = useCompositionStore();

function onDocClick(event) {
  if (!store.getEditModeStatus) return;
  if (!store.cursor) return;
  const t = event.target;
  if (!(t instanceof Element)) return;
  // Only stay selected when clicking the fret cell / editor chrome panels
  if (t.closest("[data-tab-cell]")) return;
  if (t.closest(".popup-panel")) return;
  if (t.closest(".overlay-input")) return;
  if (t.closest(".panel")) return;
  if (t.closest(".flag-btn")) return;
  store.clearCursor();
}

onMounted(() => {
  document.addEventListener("click", onDocClick);
});
onUnmounted(() => {
  document.removeEventListener("click", onDocClick);
});
</script>

<template lang="pug">
    BarList
</template>

<style scoped></style>
