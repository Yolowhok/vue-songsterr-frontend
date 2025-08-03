<script setup>
import CompositionItem from "./CompositionItem.vue";
// import { useMyStore } from "../../store/notesheet-store";
import { useRouter } from "vue-router";
import { newStore } from "../../store/notesheet-store";
import { onMounted, onBeforeMount, ref, computed } from "vue";

const store = newStore();
const compositionsList = computed(() => store.getCompositionList);
</script>

<template lang="pug">
    div.container
      div.header 
        h1.text СПИСОК ТАБОВ 
        div.input-container
            div.container-for-input
              input.search-input(type="text",
                                placeholder="Поиск...",
                                @focus="isFocused = true",
                                @blur="isFocused = false")
              span.search-icon
                i.material-icons search
      div.list(v-if="!store.isCompositionListEmpty")
        div.test 
          div(v-for="(composition, index) in compositionsList")
            CompositionItem(
                  :composition="composition" 
                  :index="index")


</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  /* height: 50%; */
  width: 100%;
  /* Занимает всю высоту экрана */
  overflow: hidden; /* Скрывает общую прокрутку */
}
.test {
  height: 50vh;
  width: 100%;
}
.header {
  flex-shrink: 0; /* Не сжимается */
  height: 6vh;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: space-evenly;
  align-items: center;
}
.text {
  font-weight: 100;
}

.list {
  display: flex; /* Используем flexbox для центрирования */
  flex-direction: column; /* Указываем направление по вертикали */
  align-items: center; /* Центрируем по горизонтали */
  justify-content: center; /* Центрируем по вертикали */
  /* top: 0%; */
}
.list {
  flex-grow: 1; /* Занимает все доступное пространство */
  overflow-y: auto; /* Вертикальная прокрутка */
  padding: 1rem;
  /* Остальные стили list... */
}
/* Контейнер списка с прокруткой */
.list {
  flex-grow: 1; /* Занимает все доступное пространство */
  overflow-y: auto; /* Вертикальная прокрутка */
  padding: 1rem;
  /* Остальные стили list... */
}
.text {
  font-weight: 300;
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

/* Стили для поля ввода */
.input-container {
  position: relative;
}

.search-input {
  padding: 0.8rem 1rem 0.8rem 3rem;

  border: 2px solid #e0e0e0;
  border-radius: 50px;
  outline: none;
  transition: all 0.3s ease;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:focus {
    border-color: #7a22fe;
    box-shadow: 0 0 0 3px rgba(78, 124, 255, 0.2);

    &::placeholder {
      color: transparent;
    }
  }

  &::placeholder {
    color: #9e9e9e;
    transition: color 0.3s ease;
  }
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9e9e9e;
  transition: color 0.3s ease;
}

.search-input:focus + .search-icon {
  color: #7a22fe;
}

/* Анимация при фокусе */
@keyframes input-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(78, 124, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(78, 124, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(78, 124, 255, 0);
  }
}

.search-input:focus {
  animation: input-pulse 1.5s infinite;
}

/* Стили для списка */
.list {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  margin-top: 1rem;

  pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: "Roboto Mono", monospace;
    color: #37474f;
    line-height: 1.5;
  }
}
@media (max-aspect-ratio: 3/4) {
  .header {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: space-evenly;
    align-items: center;
  }
  .container {
    padding-top: 15%;
  }
  .input-container {
    align-items: center;
    width: 100%;
  }
  input {
    width: 50%;
    padding: 0px;
  }
  .container-for-input {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: center;
    align-items: center;
  }
  .search-icon {
    display: none;
  }
}
</style>
