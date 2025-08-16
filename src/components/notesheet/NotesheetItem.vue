<script setup>
import { defineProps } from "vue";
import { useMyStore } from "../../store/notesheet-store";
const props = defineProps({
  notesheet: {
    type: Object,
  },
  index: {
    type: Number,
  },
});

const store = useMyStore();

function loadComposition(id) {
  store.fetchSetNotesheetChoise(props.index);
}
</script>

<template lang="pug">
        div( @click="loadComposition(props.notesheet?.id)").notesheet-item.notesheet
            h2.instrument {{props.notesheet?.instrument?.name}}
            h1.tuning {{props.notesheet?.tuning?.name}}
            h3 {{props.notesheet?.instrument?.id}}

            
</template>

<style scoped>
.notesheet {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.notesheet-item {
  width: 500px;
  padding: 1rem;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  align-items: center;
  border: 1px solid #0000;
  border-top: 1px solid var(--section-divider-color);
  box-sizing: border-box;
  color: var(--text);
  cursor: pointer;
  display: flex;
  padding: 8px 30px 8px 0;
  scroll-margin: 120px 0;
  z-index: 100;
}
.notesheet-item:hover {
  transform: translateY(-2px);
}
.instrument {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}
.tuning {
  font-size: 1.2rem;
  font-weight: 500;
  color: #34495e;
  margin: 0.5rem 0;
}
.creation-time {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0.25rem 0;
}
.composition-id {
  font-size: 0.9rem;
  color: #bdc3c7;
  margin: 0;
}
.index {
  font-size: 0.9rem;
  color: #e67e22;
  margin: 0;
}
</style>
