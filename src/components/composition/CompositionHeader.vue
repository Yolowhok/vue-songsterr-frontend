<script setup>
import { ref, watch, onMounted } from "vue";
import { newStore } from "../../store/notesheet-store";

const store = newStore();
const composition = ref(null);
watch(
  () => store.getChosenComposition,
  (newVal) => {
    composition.value = newVal;
  },
  { immediate: true }
);

onMounted(() => {
  composition.value = store.getChosenComposition;
});
</script>

<template lang="pug">
div.header
  div.title
    h1 {{composition?.title }}
  div.band
    h2 {{composition?.band }}
  div.date(v-if="composition?.updatedAt")
    h3 Обновлён:
    h3 {{new Date(composition.updatedAt).toLocaleDateString()}}  
</template>

<style scoped>
.date {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: row;
  gap: 5%;
}
.header {
  padding-top: 5%;
}
.title h1 {
  font-size: 2.8rem;
  color: #000000;
  margin: 0 0 10px 0;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
}
.band h2 {
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
  font-size: 1.1rem;
  color: #636363;
  margin: 0;
  user-select: none;
}
.title:hover h1,
.band:hover h2 {
  color: #414141;
  cursor: default;
  transition: color 0.3s ease;
}
</style>
