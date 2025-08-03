<script setup>
import Beat from "./Beat.vue";
import BeatAdd from "./BeatAdd.vue";
import { watch, defineProps } from "vue";
import { computed, toRefs } from "vue";
import { useMyStore } from "../../store/notesheet-store";
const props = defineProps({
  beats: {
    type: Object,
  },
  orderIndex: {
    type: Number,
  },
  barId: {
    type: Number,
  },
});

const store = useMyStore();

// watch(() => store.notesheets);

const lastOrderIndex = computed(() => {
  if (!props.beats.length) return 0;
  // Получаем orderIndex последнего бита и прибавляем 1
  return props.beats[props.beats.length - 1].orderIndex + 1;
});
</script>
<template lang="pug">
    div.BeatList
        //- BeatAdd(:barOrderIndex="props.orderIndex" :beatOrderIndex="-1" :visible="false")

        //- Перебираем все beats с оберткой
        div.beat-wrapper(v-for="beat in props.beats" :key="beat.id" style="position: relative;")
          Beat(:beat="beat" :id="beat.id" :orderIndex="props.orderIndex" :barId="props.barId" :beatId="beat.id" :beatOrderIndex="beat.orderIndex")
          //- BeatAdd.added.overlay(v-if="beat.beatNotes.length < 1" :beatOrderIndex="-1" :visible="true")

        //- BeatAdd(:barOrderIndex="props.orderIndex" :beatOrderIndex="lastOrderIndex" :visible="false")

</template>

<style scoped>
.BeatList {
  height: 100%;
  width: 100%;
  display: flex; /* Если нужно выровнять элементы внутри */
  align-items: center; /* Центрируем элементы внутри по вертикали */
  justify-content: left; /* Центрируем элементы внутри по горизонтали */
  flex-direction: row;
  /* padding-left: 18%; */
  /* padding-right: 18%; */
  /* gap: 15%; */
}

.beat-wrapper {
  position: relative;
  /* display: inline-block; */
  /* или flex, чтобы подстроиться под содержимое */
  padding: 0;
  margin: 0;
  opacity: 1 !important;
}

.beat-wrapper .overlay {
  position: absolute;
  top: 0;
  left: 0;

  height: 100%;
  /* z-index: 10; */
  pointer-events: none; /* чтобы не блокировать клики */
}
</style>
