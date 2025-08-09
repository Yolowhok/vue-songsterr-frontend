<script setup>
import Navigation from "./navigation/Navigation.vue";
import ToolsFooter from "./navigation/ToolsFooter.vue";
import Modal from "./navigation/Modal.vue";
import { computed, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { newStore } from "../store/notesheet-store";
defineOptions({
  name: "General", // Важно! Именно 'General' с большой буквы
});
const route = useRoute();
const router = useRouter();

// Видимость модалки определяется мета-данными роута
const isModalVisible = computed(() => route.meta.requiresModal || false);

// Закрытие модалки через навигацию назад
const handleModalClose = () => {
  router.go(-1);
};
</script>

<template lang="pug">
div.values 
  Navigation
  
  <!-- Основной контент -->
  div.main 
    router-view
  
  <!-- Модальное окно -->
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
  /* width: 80vw; */
  /* height: 5000px; */
  width: 100%;
  height: 100%;
}
</style>
