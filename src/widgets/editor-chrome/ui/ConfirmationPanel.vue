<script setup>
import { useCompositionStore } from "@/entities/composition";
import { useRoute } from "vue-router";
const route = useRoute();
const store = useCompositionStore();
defineProps({
  isVisible: Boolean,
  title: String,
  message: String,
  isProcessing: Boolean,
});

defineEmits(["confirm", "cancel"]);
</script>

<template lang="pug">
div.notesheet-panel(style="position: fixed; z-index: 1000;")
  div.notesheet-list
        h2 {{ title }}
        p {{ message }}

  div.panel-controls(v-if="store.getEditModeStatus")
    div.control-button( @click="$emit('confirm')" :disabled="isProcessing")
      span.material-symbols-outlined add
      span  {{ isProcessing ? 'Обработка...' : 'Подтвердить' }}


    div.control-button.trash(v-if="store.getEditModeStatus"
          @click="$emit('cancel')"
          :disabled="isProcessing")
      span.material-symbols-outlined delete
      span Отмена
</template>

<style scoped>
.notesheet-panel {
  position: relative;
  z-index: 1000;
  bottom: 10%;
  right: 13%;
  width: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px;
  max-height: 80vh;
  overflow-y: auto;
}
.notesheet-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.notesheet-item {
  padding: 12px 16px;
  background: #faf8fc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  border-left: 3px solid #ebe2f0;
}
.notesheet-item:hover {
  background: #f6f1f9;
  transform: translateX(2px);
}
.notesheet-item.active {
  background: #f2e0ff;
  border-left-color: #6366f1;
}
.notesheet-name {
  font-weight: 500;
  color: #1e293b;
}
.notesheet-meta {
  font-size: 0.75rem;
  color: #64748b;
  opacity: 0.8;
}
.panel-controls {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}
.control-button {
  flex: 1;
  padding: 8px 12px;
  background: #f8f8f8;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #000000;
  transition: all 0.2s ease;
}
.control-button:hover {
  background: rgb(131, 38, 251);
  color: white;
}
.control-button.trash {
  background: #f8f8f8;

  color: #000000;
}
.control-button.trash:hover {
  color: #ffffff;
  background: #f44336;
}
.control-button.trash:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f3f4f6;
}
.material-symbols-outlined {
  font-size: 18px;
}
</style>
