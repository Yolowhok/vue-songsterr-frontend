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
import { useCompositionStore } from "@/entities/composition";
import ConfirmationPanel from "./ConfirmationPanel.vue";
import NotesheetsListPanel from "./NotesheetsListPanel.vue";
import eventBus from "@/shared/lib/eventBus";
const store = useCompositionStore();
const emit = defineEmits(["open-modal"]);

const isVisible = ref(false);
const confirmationPanelIsVisible = ref(false);
const openModal = () => {
  emit("open-modal");
};
const isModalVisible = ref(false);
const panelRef = ref(null);
const openButtonSaveConfirmationRef = ref(null);
const openButtonDeleteConfirmationRef = ref(null);

const confirmationPanelRef = ref(null);
const props = defineProps({
  parentStore: {
    type: Object,
  },
});
// async function saveNotesheet() {
//   await store.fetchSaveNotesheet(
//     store.getComposition?.notesheets[store.getChosenNotesheet]
//   );
// }
// async function deleteComposition() {
//   await store.fetchDeleteComposition(route.params.id);
//   store.setChosenComposition(null);
//   await store.fetchCompositionList();
//   await router.push("/?refresh=1");
//   await nextTick();
// }
function changeOrientation() {
  store.toggleOrientation();
}
function openNotesheetList() {
  isVisible.value = !isVisible.value;
}
const openButtonRef = ref(null);
const notesheetListPanelRef = ref(null);
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
const handleClickOutsideForConfirmPanel = (event) => {
  if (
    confirmationPanelIsVisible.value &&
    confirmationPanelRef.value &&
    (openButtonSaveConfirmationRef.value ||
      openButtonDeleteConfirmationRef.value) &&
    !confirmationPanelRef.value.$el.contains(event.target) &&
    !(
      openButtonSaveConfirmationRef.value.contains(event.target) ||
      openButtonDeleteConfirmationRef.value.contains(event.target)
    )
  ) {
    confirmationPanelIsVisible.value = false;
  }
};
function closeNotesheetListPanel() {
  isVisible.value = false;
}
function changeEditMode() {
  store.changeEditModeStatus();
  console.log(store.getEditModeStatus);
  confirmationPanelIsVisible.value = false;
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("click", handleClickOutsideForConfirmPanel);
  eventBus.on("close-notesheet-list-panel", closeNotesheetListPanel);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("click", handleClickOutsideForConfirmPanel);

  eventBus.off("close-notesheet-list-panel", closeNotesheetListPanel);
});

function openConfirmationPanel() {
  confirmationPanelIsVisible.value = !confirmationPanelIsVisible.value;
}
const confirmationModal = reactive({
  visible: false,
  title: "",
  message: "",
  action: null,
  isProcessing: false,
});
function showConfirmation(action, title, message) {
  confirmationModal.title = title;
  confirmationModal.message = message;
  confirmationModal.action = action;
  confirmationModal.visible = true;
  confirmationModal.isProcessing = false;
}
async function executeConfirmedAction() {
  confirmationModal.isProcessing = true;
  try {
    await confirmationModal.action();
    setTimeout(() => {
      confirmationModal.isProcessing = false;
    }, 1500);
  } finally {
    setTimeout(() => {
      confirmationModal.isProcessing = false;
    }, 1500);
  }
}
async function saveNotesheet() {
  await store.saveCompositionNow();
}

async function deleteComposition() {
  openConfirmationPanel();
  showConfirmation(
    async () => {
      await store.fetchDeleteComposition(route.params.id);
      store.setChosenComposition(null);
      await store.fetchCompositionList();
      await router.push("/?refresh=1");
      await nextTick();
      console.log("Deleted");
    },
    "Подтверждение удаления",
    "Вы уверены, что хотите удалить эту композицию? Это действие нельзя отменить."
  );
}
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
                  div.link.default(@click="changeOrientation")
                    i.material-symbols-outlined switch_access_2
                    span.link-text ИЗМЕНИТЬ РАСПОЛОЖЕНИЕ
            li
              div.flex
                button.action-btn(:class="{ 'active': store.getEditModeStatus }")
                  div.link.default(@click="changeEditMode")
                    i.material-symbols-outlined edit_note
                    span.link-text РЕДАКТИРОВАТЬ
            li
              div.flex
                button.action-btn(@click="store.togglePlayback()")
                  div.link.default
                    i.material-symbols-outlined {{ store.isPlaying ? 'pause' : 'play_arrow' }}
                    span.link-text {{ store.isPlaying ? 'ПАУЗА' : 'PLAY' }}
            li(v-if="store.isPlaying || store.playhead")
              div.flex
                button.action-btn(@click="store.stopPlayback()")
                  div.link.default
                    i.material-symbols-outlined stop
                    span.link-text СТОП
            li(v-if="store.getEditModeStatus")
              div.flex
                button.action-btn(ref="openButtonSaveConfirmationRef" @click="saveNotesheet")
                  div.link.default
                    i.material-symbols-outlined save
                    span.link-text СОХРАНИТЬ
            li(v-if="store.getEditModeStatus && store.canUndo")
              div.flex
                button.action-btn(@click="store.undo()")
                  div.link.default
                    i.material-symbols-outlined undo
                    span.link-text ОТМЕНИТЬ
            li(v-if="store.getEditModeStatus && store.canRedo")
              div.flex
                button.action-btn(@click="store.redo()")
                  div.link.default
                    i.material-symbols-outlined redo
                    span.link-text ВЕРНУТЬ
            li(v-if="store.getEditModeStatus")
              div.flex
                button.action-btn(ref="openButtonDeleteConfirmationRef" @click="deleteComposition" )
                  div.link.delete
                    i.material-symbols-outlined scan_delete
                    span.link-text УДАЛИТЬ
      span.save-status(
        v-if="store.saveStatusLabel"
        :class="{ dirty: store.isDirty, saving: store.isSaving, error: !!store.saveError }"
      ) {{ store.saveStatusLabel }}
      ConfirmationPanel(v-if="confirmationPanelIsVisible"   ref="confirmationPanelRef"
                        :title="confirmationModal.title",
                        :message="confirmationModal.message",
                        :isProcessing="confirmationModal.isProcessing",
                        @confirm="executeConfirmedAction",
                        @cancel="confirmationModal.visible = false")

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
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 15px;
  box-sizing: border-box;
  z-index: 10;
  padding: 0 20px;
}
.save-status {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: #8a8a8a;
  white-space: nowrap;
  pointer-events: none;
  max-width: 9rem;
  text-align: right;
  line-height: 1.2;
}
.save-status.dirty {
  color: #b45309;
}
.save-status.saving {
  color: #4c73fe;
}
.save-status.error {
  color: #c62828;
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
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 75%;
  justify-content: center;
  margin: 0 auto;
}
.link {
  cursor: pointer;
  font-weight: 500;
  color: #6f6f6f;
  font-size: clamp(14px, calc(0.5vw + 0.5vh), 50px);
  display: flex;
  flex-direction: column;
}
.logo img {
  height: 50px;
}
.link:hover {
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
  position: relative;
}
.navigation a {
  text-decoration: none;
  color: #6f6f6f;
  font-weight: 400;
  transition: color 0.3s, background-color 0.3s;
  border-radius: 4px;
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
  color: rgb(131, 38, 251);
}
.delete:hover {
  color: #f44336;
}
.active {
  transform: translateY(1px) !important;
}

.active .link.default {
  color: #8326fb !important;
  /* border-bottom: solid 3px #ffcb46; */
  border-bottom: solid 3px #4c73fe;
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
