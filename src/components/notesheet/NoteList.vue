<script setup>
import NoteV2 from "./NoteV2.vue";
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
  if (!props.beat?.beatNotes) return { id: 0 };
  const foundNote = props.beat.beatNotes.find(
    (note) => note?.position?.string === numberString
  );
  return foundNote || null;
}
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
  width: 100%;
  height: 100%;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-start;
}
</style>
