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
  display: flex; /* Используем flexbox для центрирования */
  flex-direction: column; /* Указываем направление по вертикали */
  align-items: center; /* Центрируем по горизонтали */
  justify-content: center; /* Центрируем по вертикали */
  top: 0%;
  padding-bottom: 10px;
}
button {
  background-color: #ffffff; /* приятный зеленый */
  color: rgb(0, 0, 0); /* белый текст */
  border: none;
  padding: 12px 24px; /* внутренние отступы */
  font-size: 16px; /* размер текста */
  font-weight: 600; /* чуть жирнее */
  border-radius: 8px; /* скругленные углы */
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* лёгкая тень */
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  /* background-color: #000000; чуть темнее при наведении */
  transform: translateY(-2px); /* небольшой подъём */
}

button:active {
  background-color: #cf00dd9d; /* ещё темнее при нажатии */
  transform: translateY(0);
}
</style>
