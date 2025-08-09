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
  text.time-signature(x="50%" y="35%" font-size="26" text-anchor="middle" dominant-baseline="middle") {{props.bar?.timeSignature?.upper}}
  text.time-signature(x="50%" y="85%" font-size="26" text-anchor="middle" dominant-baseline="middle") {{props.bar?.timeSignature?.lower}}
  line.divider(x1="10" y1="0" x2="10" y2="40" stroke="black" stroke-width="1")
</template>

<style scoped>
.beat {
  transition: all 0.3s ease;
}

.beat:hover {
  cursor: pointer;
}

.beat:hover .time-signature {
  fill: rgb(131, 38, 251);
}

.beat:hover .divider {
  stroke: rgb(131, 38, 251);
}
</style>
