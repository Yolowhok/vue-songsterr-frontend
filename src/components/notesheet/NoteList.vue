<script setup>
import Note from "./Note.vue";
import NoteTest from "./NoteTest.vue";
import NoteV2 from "./NoteV2.vue";
import { watch } from "vue";
import { useMyStore } from "../../store/notesheet-store";
const props = defineProps({
  beat: {
    type: Object,
  },
  orderIndex: {
    type: Number,
  },
  barId: {
    type: Number,
  },
  beatId: {
    type: Number,
  },
  beatOrderIndex: {
    type: Number,
  },
});

const store = useMyStore();

function getNoteValue(numberString) {
  // Добавляем проверку на существование beatNotes
  if (!props.beat?.beatNotes) return { id: 0 };
  // Используем find для поиска элемента
  const foundNote = props.beat.beatNotes.find(
    (note) => note?.position?.string === numberString
  );
  return foundNote || null;
}
// console.log("notelist ", props.beat);
</script>
<template lang="pug">
    div.NoteList 
        div(v-for="i in 6" :numberString="i")
            NoteV2(:beatNotes="props.beat.beatNotes", :orderIndex="props.orderIndex" :numberString="i" :notevaluef="getNoteValue(i)" :barId="props.barId" :beatId="props?.beatId" :beatOrderIndex="props.beatOrderIndex")

</template>
<style scoped>
.note-value {
  height: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.NoteList {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* flex-direction: column; */
  width: 100%;
  height: 100%;
  flex-wrap: nowrap;
  align-content: center;
  /* justify-content: center; */

  /* УДАЛИТЬ ЕСЛИ СЛОМАЕТСЯ */
  justify-content: flex-start;
  /* gap: 5%; */
  /* Если нужно выровнять элементы внутри */
  /* align-items: center; */
  /* Центрируем элементы внутри по вертикали */
  /* justify-content: center; */
  /* Центрируем элементы внутри по горизонтали */
  /* flex-direction: column; */
  /* width: 100%;
  height: 100%; */
}
</style>
