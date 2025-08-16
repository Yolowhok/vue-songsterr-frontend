<script setup>
import { ref } from "vue";
import { computed } from "vue";
import { createComposition } from "../../api/compositionAPI";
import { Composition } from "../../models/Composition";
import { useRouter } from "vue-router";
import { useMyStore } from "../../store/notesheet-store";

const store = useMyStore();
const router = useRouter();

const props = defineProps({
  id: String,
});
const instruments = computed(() => store.instruments.data);
const tunings = computed(() => store.tunings.data);

const instrument = ref("");
const tuning = ref("");

const url = computed(() => Number(props.id));

async function submitForm() {
  await store.fetchCreateNotesheet(instrument, tuning);
  await store.fetchCompositionNotesheetsList(store.notesheets.id);
}
async function postCreateComposition(data) {
  try {
    const response = await createComposition(data);
    console.log("Успешно", response.data);
    router.push({ name: "composition", params: { id: response.data.id } });
  } catch (e) {
    console.error("Ошибка", e);
  }
}
</script>

<template lang="pug">
 
  form(@submit.prevent="submitForm")
    div
      label(for="band") Инструмент
      select#band(v-model="instrument" required)
        option(value="" disabled selected) Выберите инструмент
        option(
          v-for="instrument in instruments"
          :key="instrument.id"
          :value="instrument"

        ) {{ instrument.name }}
    div
      label(for="band") Строй
      select#band(v-model="tuning" required)
        option(value="" disabled selected) Гитарный строй
        option(
          v-for="tuning in tunings"
          :key="tuning.id"
          :value="tuning"

        ) {{ tuning.name }}
    button(type="submit") Создать
</template>

<style scoped>
form {
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
}
</style>
