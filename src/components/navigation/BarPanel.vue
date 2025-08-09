<script setup>
import { defineProps, computed } from "vue";
import { useMyStore } from "../../store/notesheet-store";
import { newStore } from "../../store/notesheet-store";

const store = newStore();
const storePinia = useMyStore();
const props = defineProps({
  bar: {
    type: Object,
  },
  index: {
    type: Number,
  },
});
const bar = computed(() => props.bar);

function addBarLeft() {
  store.addBarLeft(bar.value?.orderIndex);
  store.checkAllDurations();
}

function addBarRight() {
  store.addBarRight(bar.value?.orderIndex);
  store.checkAllDurations();
}

function deleteBar() {
  store.deleteBar(bar.value?.orderIndex);
  store.checkAllDurations();
}
</script>

<template lang="pug">
div.panel
  div.icon-wrapper(@click="addBarLeft")
    span.material-symbols-outlined add_column_left
  div.icon-wrapper.trash(@click="deleteBar")
    span.material-symbols-outlined.trash delete
  div.icon-wrapper(@click="addBarRight")
    span.material-symbols-outlined add_column_right

</template>

<style scoped>
.panel {
  display: flex;
  gap: 12px;
  padding: 4px;
  align-items: center;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.icon-wrapper:hover {
  /* background: #e0e0e0; */
}

.icon-wrapper.trash:hover {
  /* background: #ffebee; */
}

.material-icons-round {
  font-family: "Material Icons Round";
  font-size: 20px;
  color: #555;
  user-select: none;
}

.icon-wrapper:hover .material-icons-round {
  color: #1976d2;
}

.trash:hover .material-icons-round {
  color: #e53935;
}

/* Комбинированные иконки для добавления */
.icon-wrapper span:first-child {
  position: absolute;
  left: 4px;
}
.icon-wrapper span:last-child {
  position: absolute;
  right: 4px;
}
.material-symbols-outlined:hover {
  color: rgb(131, 38, 251);
}
.trash:hover {
  color: rgb(251, 73, 38);
}
</style>
