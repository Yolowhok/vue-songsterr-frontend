<script setup>
import Navigation from "./navigation/Navigation.vue";
import ToolsFooter from "./navigation/ToolsFooter.vue";
import Modal from "./navigation/Modal.vue";
import { computed, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { newStore } from "../store/notesheet-store";
import { ref } from "vue";

defineOptions({
  name: "General",
});
const route = useRoute();
const router = useRouter();
const store = newStore();
const isModalVisible = computed(() => route.meta.requiresModal || false);
const visitedRoutes = ref([]);

const handleModalClose = () => {
  if (window.history.length > 1 && store.getChosenComposition.id) {
    router.push(
      `/composition/` + store.getChosenComposition.id + `/notesheet/` + 0
    );
  }
};
</script>

<template lang="pug">
div.values 
  Navigation
  div.main 
    router-view
  Modal(:isVisible="isModalVisible" @update:isVisible="handleModalClose")
    router-view(name="modal")
  
  ToolsFooter
</template>
<style scoped>
.main {
  padding-top: var(--header-height);
}
.values {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
}
.main {
  width: 100%;
  height: 100%;
}
</style>
