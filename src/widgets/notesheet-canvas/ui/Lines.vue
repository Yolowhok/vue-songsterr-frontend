<script setup lang="js"></script>

<template lang="pug">
    svg(style="stroke: black; stroke-width: 0.5 ")
        line(x1='0%' x2='100%' y1='5%' y2='5%')
        line(x1='0%' x2='100%' y1='23%' y2='23%')
        line(x1='0%' x2='100%' y1='41%' y2='41%')
        line(x1='0%' x2='100%' y1='59%' y2='59%')
        line(x1='0%' x2='100%' y1='77%' y2='77%')
        line(x1='0%' x2='100%' y1='95%' y2='95%')
        line(x1='0%' x2='0' y1='5%' y2='95%')
        line(x1='100%' x2='100%' y1='5%' y2='95%')

</template>

<style scoped>
svg {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>
