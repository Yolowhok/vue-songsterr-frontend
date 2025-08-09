<script setup>
import { defineProps } from "vue";
</script>

<template lang="pug">
svg.beat.logo(width="50" height="40" xmlns="http://www.w3.org/2000/svg")
  circle.circle(cx="10" cy="20" r="3" fill="black")
</template>

<style scoped>
.beat {
  transition: all 0.3s ease;
}

.beat:hover {
  cursor: pointer;
}

.beat:hover .circle {
  fill: rgb(111, 0, 255);
}
</style>
