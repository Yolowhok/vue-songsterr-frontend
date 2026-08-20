<script setup>
import { useMyStore } from "../../store/notesheet-store";
import NotesheetItem from "./NotesheetItem.vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const store = useMyStore();
const { notesheetsList } = storeToRefs(store);
const router = useRouter();
const emit = defineEmits(["update:isVisible"]);
const closeModal = () => {
  emit("update:isVisible", false);
};
function createNewNotesheet() {
  router.push(`/notesheet/create`);
}
</script>

<template lang="pug">
  div.list
    button(@click="createNewNotesheet") New
  div.list
    div(v-for="notesheet, index in notesheetsList" :key="notesheet.id")
      NotesheetItem(:notesheet="notesheet" :index="index" @click="closeModal")
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  top: 0%;
  padding-bottom: 10px;
}
button {
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease;
}
button:hover {
  transform: translateY(-2px);
}
button:active {
  background-color: #cf00dd9d;
  transform: translateY(0);
}
</style>
