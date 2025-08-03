<script setup>
import { onMounted, onBeforeMount } from "vue";
import { newStore } from "../../store/notesheet-store";

const store = newStore();

onMounted(() => {});
onBeforeMount(async () => {});
</script>
<template lang="pug">

div.header
    div.title
        h1 {{store.getChosenComposition?.title}}
    div.band
        h2 {{store.getChosenComposition?.band}} 
    div.date(v-if="store.getChosenComposition?.updatedAt")
        h3 Обновлён:
        h3 {{store.getChosenComposition?.updatedAt}}  
</template>

<style scoped>
.date {
  width: 100%;
  display: flex; /* Если нужно выровнять элементы внутри */
  justify-content: center; /* Центрируем элементы внутри по горизонтали */
  flex-direction: row;
  gap: 5%;
}
.header {
  padding-top: 5%;
}
/* Красивый стиль для header */
.title h1 {
  /* font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; */
  font-size: 2.8rem;
  color: #000000;
  margin: 0 0 10px 0;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}

.band h2 {
  /* font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; */
  font-size: 2rem;
  color: #636363;
  margin: 0 0 15px 0;
  text-align: center;
  font-weight: 600;
  cursor: pointer;

  letter-spacing: 1.2px;
}

.date {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10%;
  margin-top: 10px;
}

.date h3 {
  /* font-family: "Courier New", Courier, monospace; */
  font-size: 1.1rem;
  color: #636363;
  margin: 0;
  /* font-style: italic; */
  user-select: none;
}

/* Эффект при наведении */
.title:hover h1,
.band:hover h2 {
  color: #414141;
  cursor: default;
  transition: color 0.3s ease;
}
</style>
