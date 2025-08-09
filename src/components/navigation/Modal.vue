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
  /* top: 0;
  left: 0;
  right: 0;
  bottom: 0; */
  width: 100%;
  height: 100%;
  background: rgba(201, 201, 201, 0.39);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 50vw;

  background-color: #ffffff;

  position: relative;

  /* color: black; */

  max-height: 75vh;
  /* Ограничиваем максимальную высоту */
  overflow-y: auto; /* Добавляем скролл, если содержимого больше, чем max-height */
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 1.5rem;
}
</style>
<!-- src/components/Modal.vue -->

<!-- <script setup>
import { defineProps, defineEmits, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(["update:isVisible"]);
const router = useRouter(); // Получаем экземпляр роутера

const closeModal = () => {
  emit("update:isVisible", false);
  // router.push("/");
  // Возвращаем на основной маршрут
};

const handleKeydown = (e) => {
  if (e.key === "Escape") closeModal();
};

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
</script> -->

<!-- <template lang="pug">
transition(name="modal")
  div(v-if="isVisible" class="modal-overlay" @click="closeModal")
    div.modal-content(@click.stop)
      span.close(@click="closeModal") × вфывыфыф
      router-view(:isVisible="isVisible" @update:isVisible="closeModal")
</template> -->

<!-- <template lang="pug">
    div(v-if="isVisible" class="modal-overlay" @click="closeModal")
      div.modal-content(@click.stop)
        span.close(@click="closeModal")

        router-view(:isVisible="isVisible" @update:isVisible="closeModal")
</template> -->

<!-- <style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 100;
}

.modal-content {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 5px;
  position: relative;
  width: 70%;

  color: black;

  max-height: 75vh;
  /* Ограничиваем максимальную высоту */
  overflow-y: auto; /* Добавляем скролл, если содержимого больше, чем max-height */
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
}
</style> -->
