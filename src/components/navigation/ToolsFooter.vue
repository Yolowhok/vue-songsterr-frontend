<script setup>
import {
  ref,
  reactive,
  onMounted,
  defineProps,
  onBeforeMount,
  inject,
  onUnmounted,
} from "vue";
import { nextTick } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import Modal from "./Modal.vue";
import { newStore } from "../../store/notesheet-store";
import NotesheetsListPanel from "./NotesheetsListPanel.vue";
const store = newStore();
const emit = defineEmits(["open-modal"]);

const isVisible = ref(false);
const openModal = () => {
  emit("open-modal");
};
const isModalVisible = ref(false);
const panelRef = ref(null);
const props = defineProps({
  store: {
    type: Object,
  },
});
function saveNotesheet() {
  // console.log(store.notesheets.notesheets[store.notesheetChoise]);
  // store.fetchSaveNotesheet(store.notesheets.notesheets[store.notesheetChoise]);
  console.log("save");
  store.fetchSaveNotesheet(
    store.getComposition?.notesheets[store.getChosenNotesheet]
  );
}
async function deleteComposition() {
  await store.fetchDeleteComposition(route.params.id);
  store.setChosenComposition(null);
  console.log("After delete", store.compositionList);
  await store.fetchCompositionList();
  await router.push("/?refresh=1");
  await nextTick();
  console.log("After fetch", store.compositionLis, store.getCachedComposition);
}
function changeOrientation() {
  store.toggleOrientation();
}
function openNotesheetList() {
  console.log("store.getNotesheetList", store.getNotesheetList);
  isVisible.value = !isVisible.value;
}
const openButtonRef = ref(null); // Ссылка на кнопку открытия
const notesheetListPanelRef = ref(null); // Ссылка на панель
const handleClickOutside = (event) => {
  if (
    isVisible.value &&
    notesheetListPanelRef.value &&
    openButtonRef.value &&
    !notesheetListPanelRef.value.$el.contains(event.target) &&
    !openButtonRef.value.contains(event.target)
  ) {
    isVisible.value = false;
  }
};

// Вешаем обработчик при монтировании
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

// Убираем обработчик при демонтировании
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
<template lang="pug">


    div.Tools-panel 
      .container
        nav
          ul.navigation
            li
              div.flex
                button.action-btn(ref="openButtonRef" @click="openNotesheetList") 
                  div.link.default
                    i.material-symbols-outlined stacks
                    span.link-text ОТКРЫТЬ ПАНЕЛЬ
              NotesheetsListPanel(v-if="isVisible" ref="notesheetListPanelRef")
            li
              div.flex
                button.action-btn
                  div.link.default(@click="saveNotesheet")
                    i.material-symbols-outlined save
                    span.link-text СОХРАНИТЬ
            li
              div.flex
                button.action-btn
                  div.link.delete(@click="deleteComposition" )
                    i.material-symbols-outlined scan_delete
                    span.link-text УДАЛИТЬ
            li
              div.flex
                button.action-btn
                  div.link.default(@click="changeOrientation")
                    i.material-symbols-outlined switch_access_2
                    span.link-text ИЗМЕНИТЬ РАСПОЛОЖЕНИЕ

</template>

<style scoped>
.Tools-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--header-height);
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  /* border-top: 1px solid #000; */
  /* чёрная рамка сверху */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 15px;
  box-sizing: border-box;
  z-index: 10; /* поверх всех окон */
  padding: 0 20px;
}
.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
  color: rgb(186, 58, 58) 0;
  font-size: clamp(25px, calc(1vw + 1.5vh), 50px);
}
.action-btn {
  background-color: rgba(0, 0, 0, 0);
  color: #6f6f6f;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}
span {
  font-size: clamp(8px, calc(1vh), 50px);
  font-weight: 600;
  padding-top: 1px;
}
.action-btn:disabled {
  opacity: 0.8;
  cursor: progress;
  transform: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.header {
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  font-family: "Roboto", sans-serif;
  width: 100%;
  position: fixed; /* Меняем sticky на fixed */
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  /* Добавляем для плавности */
  transition: transform 0.3s ease;
}
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* max-width: 1200px; */
  max-width: 75%;

  justify-content: center;
  margin: 0 auto;
  /* border-bottom: 0.1vh solid #000000;  */
  /* Линия снизу: цвет и толщина */
}
.link {
  cursor: pointer;
  font-weight: 500;
  /* color: #313131; */
  color: #6f6f6f;

  font-size: clamp(14px, calc(0.5vw + 0.5vh), 50px);
  display: flex;
  flex-direction: column;
}
.logo img {
  height: 50px;
}
.link:hover {
  /* color: #2b2b2b; */

  transition: opacity 0.3s ease, filter 0.3s ease;
}

.navigation {
  list-style: none;
  display: flex;
  gap: 2rem;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: center;
}

.navigation li {
  position: relative; /* Для псевдоэлементов */
}

.navigation a {
  text-decoration: none; /* Убираем подчеркивание */
  color: #6f6f6f; /* Цвет текста */
  font-weight: 400; /* Тонкий шрифт */
  /* padding: 0.5rem 1rem; */
  /* Отступы */
  transition: color 0.3s, background-color 0.3s; /* Плавный переход */
  border-radius: 4px; /* Закругленные углы */
}

.flex {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.link-text {
  animation: fadeInDown 0.3s ease forwards;
}

.header {
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateY(0);
  opacity: 1;
}

.header--hidden {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}
.default:hover {
  /* color: #36f439;  */
  color: rgb(131, 38, 251);
  /* Красный цвет при наведении */
}
.delete:hover {
  color: #f44336; /* Красный цвет при наведении */
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .link-text {
    animation: fadeOutDown 0.3s ease forwards;
  }
}
@media (max-height: 768px) {
  .link-text {
    animation: fadeOutDown 0.3s ease forwards;
  }
}

@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
    height: 0;
    margin: 0;
    padding: 0;
  }
}
</style>
