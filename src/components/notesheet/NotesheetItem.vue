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
// const emit = defineEmits(["update:isVisible"]);

// const closeModal = () => {
//   emit("update:isVisible", false);
// };
const store = useMyStore();
console.log("props notesheet", props.notesheet);

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
/* Общие стили для контейнера */
.notesheet {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Отступ между элементами */
  padding: 1.5rem;
  background-color: #f9f9f9; /* Легкий фон */
  border-radius: 8px; /* Закругленные углы */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Легкая тень */
}

/* Стили для элемента списка */
.notesheet-item {
  width: 500px;

  padding: 1rem;
  background-color: #fff; /* Белый фон для каждого элемента */
  border-radius: 6px; /* Закругленные углы */
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1); /* Небольшая тень */
  transition: transform 0.2s; /* Плавный переход при наведении */
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

/* Эффект при наведении на элемент списка */
.notesheet-item:hover {
  transform: translateY(-2px); /* Подъем элемента при наведении */
}

/* Стили для названия группы */
.instrument {
  font-size: 1.5rem; /* Крупный шрифт */
  font-weight: 600; /* Полужирное начертание */
  color: #2c3e50; /* Цвет текста */
  margin: 0;
}

/* Стили для названия песни */
.tuning {
  font-size: 1.2rem; /* Размер шрифта */
  font-weight: 500; /* Средний вес шрифта */
  color: #34495e; /* Текст позже для песни */
  margin: 0.5rem 0; /* Отступ между заголовками */
}

/* Стили для времени создания */
.creation-time {
  font-size: 1rem; /* Размер шрифта */
  color: #7f8c8d; /* Серый цвет */
  margin: 0.25rem 0; /* Отступ */
}

/* Стили для идентификатора композиции */
.composition-id {
  font-size: 0.9rem; /* Размер шрифта */
  color: #bdc3c7; /* Угловатый серый цвет */
  margin: 0; /* Без отступа */
}

/* Стили для индекса */
.index {
  font-size: 0.9rem; /* Размер шрифта */
  color: #e67e22; /* Цвет для индекса */
  margin: 0; /* Без отступа */
}
</style>
