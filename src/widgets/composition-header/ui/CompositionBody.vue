<script setup>
import { ref, onMounted } from "vue";
import Notesheet from "@/widgets/notesheet-canvas/ui/Notesheet.vue";
import { useCompositionStore } from "@/entities/composition";
const store = useCompositionStore();
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
