<script setup>
import { defineProps, computed } from "vue";
import Ronde from "@/shared/assets/Ronde.svg";
import Quarter from "@/shared/assets/QUARTER.svg";
import Half from "@/shared/assets/half.svg";
import Eighth from "@/shared/assets/EIGHTH.svg";
import Sixteenth from "@/shared/assets/SIXTEENTH.svg";
import ThirtySecond from "@/shared/assets/THIRTY_SECOND.svg";
import SixtyFour from "@/shared/assets/SIXTY_FOUR.svg";
import trash from "@/shared/assets/trash1.svg";
import eventBus from "@/shared/lib/eventBus";
import { useCompositionStore } from "@/entities/composition";

const props = defineProps({
  barOrderIndex: Number,
  beatOrderIndex: Number,
});

const store = useCompositionStore();

const beat = computed(() => {
  const ns = store.getComposition?.notesheets?.[store.getChosenNotesheet];
  const bar = ns?.bars?.find((b) => b.orderIndex === props.barOrderIndex);
  return bar?.beats?.find((b) => b.orderIndex === props.beatOrderIndex) || null;
});

const cursorNote = computed(() => {
  const c = store.cursor;
  if (!c || c.barOrder !== props.barOrderIndex || c.beatOrder !== props.beatOrderIndex) {
    return null;
  }
  return (
    beat.value?.beatNotes?.find((bn) => bn?.position?.string === c.string) ||
    null
  );
});

function onClick(name) {
  store.updateDurationForBeat(props.barOrderIndex, props.beatOrderIndex, name);
  eventBus.emit("upd-beat");
  eventBus.emit("close-all-beat-panels");
}
function deleteBeat() {
  eventBus.emit("close-all-beat-panels");
  store.deleteBeat(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
}
function toggleDotted() {
  store.toggleBeatDotted(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
}
function toggleRest() {
  store.toggleBeatRest(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
}
function toggleTuplet() {
  store.toggleBeatTuplet(props.barOrderIndex, props.beatOrderIndex);
  eventBus.emit("upd-beat");
}
function toggleTied() {
  store.toggleNoteTiedAtCursor();
  eventBus.emit("upd-beat");
}
function setTechnique(technique, bendValue = null) {
  store.setNoteTechniqueAtCursor(technique, bendValue);
  eventBus.emit("upd-beat");
}
</script>

<template lang="pug">
  div.panel
    div.item-container.svg-container(@click="onClick('WHOLE')")
      Ronde
    div.item-container.svg-container.svg-container-quareter(@click="onClick('HALF')")
      Half(viewBox="0 -0.5 1.6343 4.132")
    div.item-container.svg-container.svg-container-half(@click="onClick('QUARTER')")
      Quarter(viewBox="0 0 25 30")
    div.item-container.svg-container(@click="onClick('EIGHTH')")
      Eighth
    div.item-container.svg-container.svg-container-quareter(@click="onClick('SIXTEENTH')")
      Sixteenth(viewBox="0 0 30 30")
    div.item-container.svg-container.svg-container-ThirtySecond(@click="onClick('THIRTY_SECOND')")
      ThirtySecond(viewBox="-10 15 40 40")
    div.item-container.svg-container.svg-container-ThirtySecond(@click="onClick('SIXTY_FOUR')")
      SixtyFour(viewBox="-10 15 40 40")
    div.item-container.svg-container.trash(@click="deleteBeat")
        trash.trash(viewBox="0 0 25 30")

    div.rhythm-row
      button.flag-btn(
        type="button"
        :class="{ active: beat?.dotted }"
        title="Пунктир"
        @click.stop="toggleDotted"
      ) •
      button.flag-btn(
        type="button"
        :class="{ active: beat?.rest }"
        title="Пауза"
        @click.stop="toggleRest"
      ) 𝄽
      button.flag-btn(
        type="button"
        :class="{ active: beat?.tupletNum === 3 && beat?.tupletDen === 2 }"
        title="Триоль 3:2"
        @click.stop="toggleTuplet"
      ) 3

    div.artic-row(v-if="cursorNote")
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote.tied }"
        title="Лига"
        @click.stop="toggleTied"
      ) ⌒
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote.technique === 'hammer' }"
        title="Hammer-on"
        @click.stop="setTechnique('hammer')"
      ) H
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote.technique === 'pull' }"
        title="Pull-off"
        @click.stop="setTechnique('pull')"
      ) P
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote.technique === 'slide_up' }"
        title="Slide /"
        @click.stop="setTechnique('slide_up')"
      ) /
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote.technique === 'slide_down' }"
        title="Slide \\"
        @click.stop="setTechnique('slide_down')"
      ) \\
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote.technique === 'bend' && cursorNote.bendValue === 'half' }"
        title="Bend ½"
        @click.stop="setTechnique('bend', 'half')"
      ) ½
      button.flag-btn(
        type="button"
        :class="{ active: cursorNote.technique === 'bend' && cursorNote.bendValue === 'full' }"
        title="Bend full"
        @click.stop="setTechnique('bend', 'full')"
      ) full
    div.artic-hint(v-else) Курсор на ноте → лига / H P / slide / bend
</template>

<style scoped>
.panel {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  height: auto;
  justify-content: flex-start;
  align-content: flex-start;
}
.trash:hover {
  color: #e63f3f;
  filter: drop-shadow(0 0 1px rgba(255, 0, 0, 0.3));
  transition: opacity 0.3s ease, filter 0.3s ease;
}
.item-container {
  display: flex;
  width: 20px;
  height: 30px;
  box-sizing: border-box;
  transition: opacity 0.3s ease, filter 0.3s ease;
}
.item-container.svg-container:not(.svg-container-half) {
  justify-content: center;
  align-items: flex-end;
}
.item-container.svg-container.svg-container-half {
  justify-content: center;
  align-items: center;
}
.svg-container-quareter {
  justify-content: center;
  align-items: flex-end;
}
.item-container.svg-container.svg-container-ThirtySecond {
  justify-content: center;
  align-items: center;
}
.item-container.svg-container:hover {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
  cursor: pointer;
}
.rhythm-row,
.artic-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
  margin-top: 4px;
}
.flag-btn {
  min-width: 28px;
  height: 26px;
  padding: 0 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #555;
}
.flag-btn:hover {
  border-color: rgb(131, 38, 251);
  color: rgb(131, 38, 251);
}
.flag-btn.active {
  background: rgb(131, 38, 251);
  border-color: rgb(131, 38, 251);
  color: #fff;
}
.artic-hint {
  width: 100%;
  font-size: 10px;
  color: #999;
  line-height: 1.3;
}
</style>
