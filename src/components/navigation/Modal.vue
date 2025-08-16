<script setup>
import { defineProps, defineEmits, onMounted, onUnmounted } from "vue";

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(["update:isVisible"]);

const closeModal = () => {
  emit("update:isVisible", false);
};

const handleKeydown = (e) => {
  if (e.key === "Escape") closeModal();
};

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
</script>

<template lang="pug">
transition(name="modal")
  div(v-if="isVisible" class="modal-overlay" @click="closeModal")
    div.modal-content(@click.stop)
      slot
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  background: rgba(201, 201, 201, 0.39);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  width: 50vw;
  position: relative;
  max-height: 75vh;
  overflow-y: auto;
}
.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 1.5rem;
}
</style>
