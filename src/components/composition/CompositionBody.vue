<script setup>
import { ref, onMounted } from "vue";
import Notesheet from "../notesheet/Notesheet.vue";
import { newStore } from "../../store/notesheet-store";
const store = newStore();
const isLoading = ref(true);
</script>
<template lang="pug">
      div  
        div(v-if="!store.isCompositionEmpty")
          Notesheet
</template>

<style scoped>
div {
  padding-bottom: 100px;
}
</style>
