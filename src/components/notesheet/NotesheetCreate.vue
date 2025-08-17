<script setup>
import { ref } from "vue";
import { computed } from "vue";
import { createComposition } from "../../api/compositionAPI";
import { Composition } from "../../models/Composition";
import { useRoute, useRouter } from "vue-router";
import { useMyStore } from "../../store/notesheet-store";
import { newStore } from "../../store/notesheet-store";

const store = newStore();
const router = useRouter();
const route = useRoute();

const props = defineProps({
  id: String,
});
// const instruments = computed(() => store.instruments.data);
const tunings = computed(() => store.getTuningList);

const instruments = computed(() => store.getInstruments);

const instrument = ref("");
const tuning = ref("");

const url = computed(() => Number(props.id));

async function submitForm() {
  store.fetchCreateNotesheet({
    instrument: instrument.value,
    tuning: tuning.value,
    compositionID: parseInt(route.params.id),
  });
  // await store.fetchCreateNotesheet(instrument, tuning);
  // await store.fetchCompositionNotesheetsList(store.notesheets.id);
}
</script>

<template lang="pug">
div.creation-panel()
  form.creation-form(@submit.prevent="submitForm")
    div.form-group
      label.form-label(for="instrument") Инструмент
      select.form-select(
        id="instrument"
        v-model="instrument"
        required
      )
        option(value="" disabled selected) Выберите инструмент
        option(
          v-for="item in instruments"
          :key="item.id"
          :value="item"
        ) {{ item.name }}

    div.form-group
      label.form-label(for="tuning") Строй
      select.form-select(
        id="tuning"
        v-model="tuning"
        required
      )
        option(value="" disabled selected) Гитарный строй
        option(
          v-for="item in tunings"
          :key="item.id"
          :value="item"
        ) {{ item.name }}

    div.panel-controls
      button.control-button(type="submit")
        span.material-symbols-outlined add
        span Создать
</template>

<style scoped>
.creation-panel {
  position: relative;
  z-index: 1000;
  background: white;
  border-radius: 12px;
  padding: 16px;
}
.creation-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-label {
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
}
.form-select {
  padding: 12px 16px;
  background: #faf8fc;
  border-radius: 8px;
  border: none;
  border-left: 3px solid #ebe2f0;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.2s ease;
  cursor: pointer;
}
.form-select:focus {
  outline: none;
  background: #f6f1f9;
  border-left-color: #6366f1;
}
.panel-controls {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}
.control-button {
  flex: 1;
  padding: 8px 12px;
  background: #f8f8f8;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.85rem;
  color: rgb(0, 0, 0);
  transition: all 0.2s ease;
  border: none;
}
.control-button:hover {
  background: rgb(131, 38, 251);
  color: rgb(255, 253, 253);
}
.material-symbols-outlined {
  font-size: 18px;
}
</style>
