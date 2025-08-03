<script setup>
import { defineProps } from "vue";

const props = defineProps({
  bar: {
    type: Object,
    default: () => ({
      timeSignature: {
        upper: 4,
        lower: 4,
      },
    }),
  },
});
</script>

<template lang="pug">
  svg.beat.logo(width="50" height="40" xmlns="http://www.w3.org/2000/svg") 
    text(x="50%" y="35%" font-size="28" text-anchor="middle" dominant-baseline="middle") {{props.bar?.timeSignature?.upper}}
    text(x="50%" y="85%" font-size="28" text-anchor="middle" dominant-baseline="middle") {{props.bar?.timeSignature?.lower}}
    line(x1="10" y1="0" x2="10" y2="40" stroke="black" stroke-width="1")
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
