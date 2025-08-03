<script setup></script>
<template lang="pug">
    div.svg-content
        svg(viewBox="0 0 100 100" width="100%" height="100%")
            rect(width="100%" height="100%" rx="20%" ry="50%" fill="white" fill-opacity="0.1")
            text(x="50%" y="70%" font-size="100" dominant-baseline="middle" text-anchor="middle") 1

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
  /* Увеличение */
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
  /* Тень */
  fill-opacity: 1;
}
.svg {
  width: 100%;
  height: 100%;
}
</style>
