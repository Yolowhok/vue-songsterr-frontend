<script setup>
import Beat from "./Beat.vue";
import BeatAdd from "./BeatAdd.vue";
import { watch, defineProps, ref, onBeforeMount, onUpdated } from "vue";
import { computed, toRefs, reactive } from "vue";
import { useMyStore } from "../../store/notesheet-store";
import { newStore } from "../../store/notesheet-store";
import eventBus from "../../eventBus";

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
  timeSignature: {
    type: Object,
  },
});

const store = newStore();
const points = reactive([]);

const lastOrderIndex = computed(() => {
  if (!props.beats.length) return 0;
  // Получаем orderIndex последнего бита и прибавляем 1
  return props.beats[props.beats.length - 1].orderIndex + 1;
});
onBeforeMount(() => {
  store.checkAllDurations();
});
onUpdated(() => {});
</script>
<template lang="pug">
    div.BeatList
        BeatAdd( :barOrderIndex="props.orderIndex" :beatOrderIndex="-1" :visible="false")
        div.beat-wrapper(v-for="beat, index in props.beats" :key="beat.id" style="position: relative;")
          Beat(:beat="beat" :id="beat.id" :orderIndex="props.orderIndex" :barId="props.barId" :beatId="beat?.id" :beatOrderIndex="beat.orderIndex"  )
          BeatAdd.added.overlay(v-if="beat.beatNotes.length < 1 " :beatOrderIndex="-1" :visible="true")

        BeatAdd( :barOrderIndex="props.orderIndex" :beatOrderIndex="lastOrderIndex" :visible="false")

</template>

<style scoped>
.BeatList {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: left;
  flex-direction: row;
}
.beat-wrapper {
  position: relative;
  padding: 0;
  margin: 0;
  opacity: 1 !important;
}
.beat-wrapper .overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  pointer-events: none;
}
</style>
