<script setup>
import { defineProps } from "vue";
const width = 100;
const height = 100;
const props = defineProps({
  points: {
    type: Object,
  },
});
console.log("POINTS", props.points);
</script>

<template lang="pug">
    svg(
    :width="width"
    :height="height"
    viewBox="0 0 100 150"
    xmlns="http://www.w3.org/2000/svg"
    )
        line(x1="55" y1="20" x2="55" y2="130" stroke="black" stroke-width="2")
        //- line(:x1="props.points.x1" y1="20" :x2="props.points.x2" y2="130" stroke="black" stroke-width="2")

</template>
