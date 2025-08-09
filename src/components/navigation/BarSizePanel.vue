<script setup>
import { defineProps, ref, watch } from "vue";
import { newStore } from "../../store/notesheet-store";

const props = defineProps({
  bar: Object,
});

const store = newStore();
const upper = ref(props.bar?.timeSignature.upper);
const lower = ref(props.bar?.timeSignature.lower);

// Допустимые значения для lower (степени двойки)
const validLowerValues = [1, 2, 4, 8, 16, 32, 64, 128];

function clampUpper(value) {
  if (value === "" || value === null) return "";
  const num = Math.round(Number(value));
  if (isNaN(num)) return "";
  return Math.min(128, Math.max(1, num));
}

function clampLower(value) {
  if (value === "" || value === null) return "";
  const num = Math.round(Number(value));
  if (isNaN(num)) return "";

  // Находим ближайшую допустимую степень двойки
  return validLowerValues.reduce((prev, curr) =>
    Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
  );
}

watch(upper, (newVal) => {
  upper.value = clampUpper(newVal);
});

watch(lower, (newVal) => {
  lower.value = clampLower(newVal);
});

function confirmBarSize() {
  store.updateBarSize(props.bar.orderIndex, {
    upper: upper.value || 4,
    lower: lower.value || 4,
  });
}
</script>

<template lang="pug">
div.panel
  div
    input(
      type="number"
      v-model.number="upper"
      min="1"
      max="32"
      @keypress="(e) => /[0-9]/.test(e.key) || e.preventDefault()"
    )
  div
    input(
      type="number"
      v-model.number="lower"
      min="1"
      max="32"
      @keypress="(e) => /[0-9]/.test(e.key) || e.preventDefault()"
    )
  button(type="button" @click="confirmBarSize") ОК
</template>

<style scoped>
/* Для Chrome, Safari, Edge */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Для Firefox */
input[type="number"] {
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

button:hover {
  box-shadow: 0 0px 1px rgba(0, 0, 0, 0.3); /* теневой эффект при наведении */
  background-color: #f0f0f0; /* чуть светлый фон для наглядности */
}
input[type="number"] {
  border: none;
  border-bottom: 2px solid #333; /* линия снизу */
  outline: none;
  width: 3ch; /* ширина примерно для 3 символов */
  text-align: center; /* центрируем текст */
  font-size: 1.2rem;
  padding: 5px 0;
  margin: 0 auto; /* центрируем сам input по горизонтали */
  display: block; /* чтобы margin:auto сработал */
  background: transparent;
  transition: border-color 0.3s ease;
}

input[type="number"]:focus {
  border-bottom-color: rgb(111, 0, 255); /* цвет линии при фокусе */
}
.trash:hover {
  color: #e63f3f;
  filter: drop-shadow(0 0 1px rgba(255, 0, 0, 0.338));
  transition: opacity 0.3s ease, filter 0.3s ease;
}
.item-container {
  display: flex;
  width: 30px;
  height: 30px;
  box-sizing: border-box;
  /* Убедимся, что переход применяется и по умолчанию */
  transition: opacity 0.3s ease, filter 0.3s ease;
}

/* Для Ronde: центр по горизонтали, внизу по вертикали */
.item-container.svg-container:not(.svg-container-half) {
  justify-content: center;
  align-items: flex-end;
}

/* Для Half: центр по горизонтали и по вертикали */
.item-container.svg-container.svg-container-half {
  justify-content: center;
  align-items: center;
  /* justify-content: center; */
  /* align-items: flex-end; */
}

.svg-container-quareter {
  justify-content: center;
  align-items: flex-end;
}
.item-container.svg-container.svg-container-ThirtySecond {
  justify-content: center;
  align-items: center;
}

/* Подсветка svg при наведении на контейнер */
.item-container.svg-container:hover {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  cursor: pointer; /* по желанию */
}
</style>
