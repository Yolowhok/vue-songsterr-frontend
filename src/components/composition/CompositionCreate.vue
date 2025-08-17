<script setup>
import { ref } from "vue";
import { newStore } from "../../store/notesheet-store";
import { useRouter } from "vue-router";

const router = useRouter();
const store = newStore();
const band = ref("");
const title = ref("");

async function createNewNotesheet() {
  const composition = await store.fetchCreateComposition({
    band: band.value,
    title: title.value,
  });
  console.log(composition.data);
  store.fetchCompositionList();

  router.push(`/composition/${composition.data.id}/notesheet/0`);
}
</script>

<template lang="pug">
div.flex
  div.creation-panel
    form(@submit.prevent="createNewNotesheet")
      div.input-group
        input#band(
          type="text" 
          v-model="band" 
          required 
          placeholder="Название группы"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        )
      div.input-group
        input#title(
          type="text" 
          v-model="title" 
          required 
          placeholder="Название композиции"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        )
      
      div.panel-controls
        button.control-button(type="submit")
          span.material-symbols-outlined add
          span Add New
</template>

<style scoped>
.flex {
  display: flex;
  justify-content: center;
  padding: 20px;
}
.creation-panel {
  width: 100%;
  max-width: 400px;
  padding: 24px;
  position: relative;
  z-index: 10;
}
.input-group {
  margin-bottom: 28px;
  position: relative;
}
.input-group::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: #e2e8f0;
  transition: background-color 0.3s ease;
}
.input-group:focus-within::after {
  background: #6366f1;
}
input[type="text"] {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1.1rem;
  padding: 12px 0;
  background: transparent;
  color: #334155;
  transition: color 0.3s ease;
}
input[type="text"]:focus {
  color: #1e293b;
}
input[type="text"]::placeholder {
  color: #94a3b8;
  font-weight: 400;
}
.panel-controls {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.control-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: #f1f1f1;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #334155;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 220px;
}
.control-button:hover {
  background: #6366f1;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.control-button:active {
  transform: translateY(0);
}
.material-symbols-outlined {
  font-size: 20px;
  font-weight: 600;
}
</style>
