<script setup>
import { ref } from "vue";
import { computed } from "vue";
import { createComposition } from "../../api/compositionAPI";
import { Composition } from "../../models/Composition";
import { useRouter } from "vue-router";
import { useMyStore } from "../../store/notesheet-store";
const router = useRouter();

const props = defineProps({
  id: String,
});
const store = useMyStore();
const band = ref("");
const title = ref("");
const emit = defineEmits();
// Функция для закрытия модального окна
const closeModal = () => {
  emit("update:isVisible", false);
};
const url = computed(() => Number(props.id));

async function submitForm() {
  if (!band.value.trim() || !title.value.trim()) {
    alert("Пожалуйста, заполните все поля");
    return;
  }

  const test = await postCreateComposition(
    Composition.create(band.value, title.value)
  );
  console.log("test", test);

  // очистка формы после отправки
  band.value = "";
  title.value = "";
  closeModal();
}
async function postCreateComposition(data) {
  try {
    const response = await createComposition(data);
    console.log("Успешно", response.data);
    // router.push({ name: "composition", params: { id: response.data.id } });
    // store.compo
    await store.fetchCompositions();
    await store.fetchCompositionNotesheet(response.data.id);
    await store.fetchCompositionNotesheetsList(response.data.id);
    router.push(`/composition/${response.data.id}`);
  } catch (e) {
    console.error("Ошибка", e);
  }
}
</script>

<template lang="pug">
  div.flex
    form(@submit.prevent="submitForm")
      div.band
        //- label(for="band") Band
        input#band(type="text" v-model="band" required placeholder="Название группы")
      div.title
        //- label(for="title") Title
        input#title(type="text" v-model="title" required placeholder="Название композиции")
      div.button
        button(type="submit") Создать
    //- div {{url}}
    //- router-link(:to="`/create/comosition/${url+1}`") test
</template>

<style scoped>
.flex {
  display: flex;
  justify-content: center;
}
.band {
  padding-bottom: 50px;
}
.title {
  padding-bottom: 50px;
}
input[type="text"]::-webkit-inner-spin-button,
input[type="text"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Для Firefox */
input[type="text"] {
  -moz-appearance: textfield;
}
.panel {
  display: flex;
  gap: 10px;
  width: 100%;
  height: auto;
  z-index: 500;
  flex-direction: column;
  align-content: center;
}
button {
  border: 1px solid #000; /* чёрная обводка */
  background: transparent; /* прозрачный фон */
  border-radius: 12px; /* полукруглые углы */
  /* padding: 8px 20px; */
  font-size: 1rem;
  cursor: pointer;
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}
.button {
  display: flex;
  justify-content: center;
}

button:hover {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.3); /* теневой эффект при наведении */
  background-color: #f0f0f0; /* чуть светлый фон для наглядности */
}
input[type="text"] {
  border: none;
  border-bottom: 2px solid #333; /* линия снизу */
  outline: none;
  width: 200; /* ширина примерно для 3 символов */
  text-align: center; /* центрируем текст */
  font-size: 1.2rem;
  padding: 5px 0;
  margin: 0 auto; /* центрируем сам input по горизонтали */
  display: block; /* чтобы margin:auto сработал */
  background: transparent;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus {
  border-bottom-color: rgb(111, 0, 255); /* цвет линии при фокусе */
}
/* form {
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

label {
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
}

input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #379870;
} */
</style>
