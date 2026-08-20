<script setup>
import { defineProps, defineEmits, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(["update:isVisible", "close"]);
const router = useRouter();
const isInternalClose = ref(false);

const closeModal = (isNavigation = false) => {
  if (!isNavigation) isInternalClose.value = true;
  emit("update:isVisible", false);
  emit("close");

  if (!isNavigation && !isInternalClose.value) {
    setTimeout(() => router.push(-1), 300);
  }
};

const handleKeydown = (e) => {
  if (e.key === "Escape") closeModal();
};

const handlePopState = () => {
  closeModal(true);
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("popstate", handlePopState);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("popstate", handlePopState);
});
</script>

<template lang="pug">
transition(name="modal")
  div(
    v-if="isVisible"
    class="modal-overlay"
    @click="closeModal()"
  )
    div.modal-content(@click.stop)
      slot
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(201, 201, 201, 0.39);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(2px);
}

.modal-content {
  width: 50vw;
  position: relative;
  max-height: 75vh;
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform-origin: center center;
}
</style>
