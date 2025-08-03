<script setup>
import { ref } from "vue";

const number = ref(1);
const editing = ref(false);
const inputValue = ref("");

function startEdit() {
  editing.value = true;
  inputValue.value = number.value !== null ? String(number.value) : "";
}

function save() {
  const val = parseInt(String(inputValue.value).trim());
  if (!isNaN(val)) {
    number.value = val;
  }
  editing.value = false;
}

function cancel() {
  editing.value = false;
}
function onKeydown(event) {
  if (event.key === "Enter") {
    save();
  } else if (event.key === "Escape") {
    cancel();
  }
}
</script>

<template>
  <div>
    <div class="svg-content" @click="startEdit">
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect
          width="100%"
          height="100%"
          rx="20%"
          ry="50%"
          fill="white"
          fill-opacity="0.1"
        />
        <text
          x="50%"
          y="70%"
          font-size="100"
          dominant-baseline="middle"
          text-anchor="middle"
        >
          {{ number }}
        </text>
      </svg>
      <div v-if="editing" class="editing-overlay">
        <input
          type="number"
          v-model="inputValue"
          @keydown="onKeydown"
          autofocus
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.svg-content {
  position: relative;
  height: 16%;
  width: 100%;
  display: flex;
  justify-content: center;
  text-align: center;

  transition: transform 0.3s ease, filter 0.3s ease;
  cursor: pointer;
}

.svg-content:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
}

.svg-content rect {
  transition: fill-opacity 0.3s ease;
  fill-opacity: 0.1;
}

.svg-content:hover rect {
  fill-opacity: 1;
}
.svg {
  width: 100%;
  height: 100%;
}
.editing-overlay {
  position: absolute;

  width: 100%;
  z-index: 10;
}
</style>
