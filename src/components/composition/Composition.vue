<script setup>
import { onMounted, onBeforeMount, ref } from "vue";
import { newStore } from "../../store/notesheet-store";
import { useRoute } from "vue-router";
import CompositionHeader from "./CompositionHeader.vue";
import CompositionBody from "./CompositionBody.vue";
const route = useRoute();
const store = newStore();

const isLoading = ref(true);
// onMounted(async () => {
//   try {
//     await store.fetchComposition(route.params.id);
//     setTimeout(() => {
//       isLoading.value = false;
//     }, 22000);
//   } finally {
//     isLoading.value = false;
//   }
// });

onMounted(async () => {
  try {
    console.log("route.params.id in composition ", route.params.id);
    await store.fetchComposition(route.params.id);
    await store.fetchNoteOctaveOrdered();

    await store.fetchCompositionList();
    await store.fetchDuration();

    store.setFretboard();
    store.setChosenNotesheet(route.params.num);
    store.setChosenComposition(store.getCompositionById(route.params.id));
    store.fetchComposition(route.params.id);

    // Перенесем таймаут ПЕРЕД finally
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    isLoading.value = false; // В случае ошибки сразу скрываем загрузку
  }
});
</script>
<template lang="pug">
div.container


  CompositionHeader.compositionHeader
  template(v-if="isLoading")
    .skeleton-body.compositionBody
      .skeleton-row(v-for="i in 10" :key="i")

  template(v-else)
    CompositionBody.compositionBody





    //- div.container
    //-   CompositionHeader.compositionHeader
    //-   CompositionBody.compositionBody





</template>

<style scoped>
.container {
  display: flex; /* Используем flexbox для контейнера */
  flex-direction: column; /* Определяем направление ОСИ flexbox по столбцам */
  align-items: center; /* Центрируем элементы по горизонтали */
  justify-content: flex-start; /* Центрируем элементы по вертикали (если высота контейнера задана) */
  height: 100%;
  /* Задаем высоту контейнера (например, 100% высоты окна) */
}
.compositionHeader {
  width: 100%; /* Задаем ширину 100% */
  height: 20%; /* Задаем высоту 15% родительского контейнера */
  background-color: #ffffff; /* Пример фона для визуализации (можно изменить) */
  display: flex; /* Для расположения элементов */
  align-items: center; /* Центрируем элементы по вертикали */
  justify-content: center; /* Центрируем элементы по горизонтали */
  flex-direction: column;
  padding-top: 5%;

  /* border-bottom: 2px solid #000000;  */
  /* Линия снизу: цвет и толщина */
}
.compositionBody {
  /* height: 115%; */
  height: 100%;
  min-height: 50vh;
  width: 100%;
}

.skeleton {
  padding-top: 5%;
}
.skeleton-header {
  width: 80%;
  gap: 1rem;
  height: 37%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.skeleton-title {
  height: 6rem;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer-2c312e49 1.5s infinite;
}

.skeleton-subtitle {
  height: 5.5rem;
  width: 40%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer-2c312e49 1.5s infinite;
}

.skeleton-body {
  width: 80%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-row {
  height: 15rem;
  /* width: 90%; */
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
