<script setup>
import { nextTick } from "vue";
import { newStore } from "../../store/notesheet-store";
import { useRouter } from "vue-router";

const router = useRouter();

const store = newStore();
const notesheets = store.getNotesheetList;

function chooseNotesheet(i) {
  store.setChosenNotesheet(i);
  router.push("/composition/" + store?.getComposition?.id + "/notesheet/" + i);

  nextTick();
  console.log("Route push is done");
}
function createNotesheet() {
  router.push(
    "/composition/" + store?.getComposition?.id + "/create/notesheet"
  );
}
</script>

<template lang="pug">
div.notesheet-panel(style="position: fixed; z-index: 1000;")
  div.notesheet-list
    div.notesheet-item(
      v-for="(notesheet, i) in notesheets"
      :key="notesheet.id"
      @click="chooseNotesheet(i)"
      :class="{ active: store.chosenNotesheet === notesheet.id }"
    )
      span.notesheet-name {{ notesheet?.instrument.name || `#${notesheet.id}` }}
      span.notesheet-meta  • {{ notesheet?.tuning?.name}}

  div.panel-controls
    div.control-button(@click="createNotesheet()")
      span.material-symbols-outlined add
      span Добавить

    div.control-button.trash(
      @click="store.deleteNotesheet(store.chosenNotesheet)"
      :disabled="!store.chosenNotesheet"
    )
      span.material-symbols-outlined delete
      span Удалить
</template>

<style scoped>
.notesheet-panel {
  position: relative;
  z-index: 1000;
  bottom: 10%;
  right: 50%;
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
