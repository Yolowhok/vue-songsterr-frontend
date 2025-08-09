<script setup>
import { newStore } from "../../store/notesheet-store";

const store = newStore();
</script>

<template lang="pug">
div.panel
  div.icon-wrapper()
    span.material-symbols-outlined add_column_left

  div.icon-wrapper()
    span.material-symbols-outlined add_column_left

  div.icon-wrapper()
    span.material-symbols-outlined add_column_left

  div.icon-wrapper()
    span.material-symbols-outlined add_column_left

  div.icon-wrapper()
    span.material-symbols-outlined add_column_left
//-   div.icon-wrapper.trash()
//-     span.material-symbols-outlined.trash delete
//-   div.icon-wrapper()
//-     span.material-symbols-outlined add_column_right
</template>

<style scoped>
.panel {
  position: fixed;
  z-index: 1000;
  bottom: 7%;
  left: 25%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 8px;
  align-items: center;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  flex-direction: column;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
}

/* Остальные стили остаются такими же */
.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-wrapper:hover {
  background: #f0f0f0;
}

.trash:hover {
  background: #ffebee;
}

.material-symbols-outlined {
  font-size: 20px;
  color: #555;
}

.icon-wrapper:hover .material-symbols-outlined {
  color: #1976d2;
}

.trash:hover .material-symbols-outlined {
  color: #e53935;
}
</style>
