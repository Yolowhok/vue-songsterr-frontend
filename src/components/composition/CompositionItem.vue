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
  store.fetchComposition(id);
  store.setChosenNotesheet(0);
  router.push(`/composition/` + id + `/notesheet/` + store.getChosenNotesheet);
  // if (props.composition && props.composition.id) {r
  //   store.fetchCompositionNotesheet(props.composition.id);
  //   store.fetchCompositionNotesheetsList(props.composition.id);
  //   store.fetchSetNotesheetChoise(0);
  //   await store.fetchCompositions();
  //   await store.fetchCompositionNotesheet(id);
  //   await store.fetchCompositionNotesheetsList(id);
  //   await store.fetchGetFretboard();
  //   await store.setDuration();
  //   await store.setTimeSignatures();
  //   await store.setInstruments();
  //   await store.setTunings();
  // }
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
  /* display: flex; */
  /* flex-direction: column; */
  gap: 1rem; /* Отступ между элементами */
  padding: 1.5rem;
  background-color: #f9f9f9; /* Легкий фон */
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

/* Стили для элемента списка */
.composition-item {
  padding: 1rem;
  background-color: #fff;

  transition: transform 0.2s; /* Плавный переход при наведении */
  align-items: center;

  color: var(--text);
  cursor: pointer;

  padding: 8px 30px 8px 0;
  z-index: 100;
}

/* Эффект при наведении на элемент списка */
.composition-item:hover {
  background-color: #f4f4f4;
  cursor: pointer;
}

/* Стили для названия группы */
.band-name {
  /* font-size: 1.5rem;  */
  font-size: clamp(14px, calc(1vw + 1vh), 100px);

  /* Крупный шрифт */
  font-weight: 550;

  color: #2c3e50; /* Цвет текста */
  margin: 0;
}

/* Стили для названия песни */
.song-title {
  font-size: clamp(14px, calc(1vw + 1vh), 100px);
  /* font-size: 1.2rem; */
  /* Размер шрифта */
  font-weight: 200;
  color: #34495e;
}
</style>
