<script setup>
import { defineProps, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { newStore } from "../../store/notesheet-store";

const store = newStore();
const router = useRouter();
const props = defineProps({
  composition: {
    type: Object,
    required: true, // Можно пометить как обязательный
  },
  index: Number,
});

const composition = ref(props.composition);
const index = ref(props.index);

async function loadComposition(id) {
  router.push(`/composition/` + id + `/notesheet/` + 0);
}
</script>

<template lang="pug">
      div(v-if="composition && composition?.id")
          div(:id="composition?.id" @click="loadComposition(composition?.id)").composition-item.composition
            div.v0
              div.v1
                div.band-name {{index+1}}.
              div.v2
                div.band-name {{composition?.band}}
                div.song-title {{composition?.title}}
</template>

<style scoped>
.item {
  display: flex;
  flex-direction: row;
  align-content: stretch;
  align-items: center;
  justify-content: space-around;
}
.composition {
  cursor: pointer;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
}
.v0 {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-start;
  align-items: center;
}
.v1 {
  width: 20%;
  text-align: center;
}
.composition-item {
  padding: 1rem;
  background-color: #fff;
  transition: transform 0.2s;
  align-items: center;
  color: var(--text);
  cursor: pointer;
  padding: 8px 30px 8px 0;
  z-index: 100;
}
.composition-item:hover {
  background-color: #f4f4f4;
  cursor: pointer;
}
.band-name {
  font-size: clamp(14px, calc(1vw + 1vh), 100px);
  font-weight: 550;
  color: #2c3e50;
  margin: 0;
}
.song-title {
  font-size: clamp(14px, calc(1vw + 1vh), 100px);
  font-weight: 200;
  color: #34495e;
}
</style>
