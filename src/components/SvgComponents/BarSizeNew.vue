<script setup>
import { defineProps } from "vue";

// const props = defineProps({
//   bar: {
//     type: Object,
//     default: () => ({
//       timeSignature: {
//         upper: 4,
//         lower: 4,
//       },
//     }),
//   },
// });
</script>

<template lang="pug">
  svg.beat.logo(width="50" height="40" xmlns="http://www.w3.org/2000/svg")
    circle(cx="10" cy="20" r="3" fill="black")
</template>
<style scoped>
.beat {
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));
  transition: opacity 0.1s ease, 0.5s ease;
  /* color: #007bff; */
  color: rgb(111, 0, 255);
}
.beat:hover {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  transition: opacity 0.3s ease, filter 0.3s ease;
  cursor: pointer;
}
</style>
