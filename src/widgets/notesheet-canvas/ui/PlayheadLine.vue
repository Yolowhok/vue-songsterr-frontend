<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useCompositionStore } from "@/entities/composition";

const store = useCompositionStore();
const rootRef = ref(null);
const style = ref({ display: "none" });
const dragging = ref(false);
const resumeAfterDrag = ref(false);

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function headerHeight() {
  return (
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height"
      )
    ) || 0
  );
}

function findBeatAt(clientX, clientY) {
  const nodes = document.querySelectorAll("[data-playhead-beat]");
  let nearest = null;
  let nearestDist = Infinity;
  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    const padY = 40;
    if (clientY < r.top - padY || clientY > r.bottom + padY) continue;
    const [barOrder, beatOrder] = el
      .getAttribute("data-playhead-beat")
      .split("-")
      .map(Number);
    if (clientX >= r.left && clientX <= r.right) {
      const progress = r.width > 0 ? (clientX - r.left) / r.width : 0;
      return {
        barOrder,
        beatOrder,
        progress: clamp(progress, 0, 1),
      };
    }
    const midX = (r.left + r.right) / 2;
    const dist = Math.abs(clientX - midX) + Math.abs(clientY - (r.top + r.height / 2)) * 0.25;
    if (dist < nearestDist) {
      nearestDist = dist;
      const progress = r.width > 0 ? clamp((clientX - r.left) / r.width, 0, 1) : 0;
      nearest = { barOrder, beatOrder, progress };
    }
  }
  return nearest;
}

function updatePosition() {
  const ph = store.playhead;
  const root = rootRef.value?.parentElement;
  if (!ph || !root) {
    style.value = { display: "none" };
    return;
  }
  const beatEl = document.querySelector(
    `[data-playhead-beat="${ph.barOrder}-${ph.beatOrder}"]`
  );
  if (!beatEl) {
    style.value = { display: "none" };
    return;
  }
  const rootRect = root.getBoundingClientRect();
  const beatRect = beatEl.getBoundingClientRect();
  const head = 36;
  const left =
    beatRect.left -
    rootRect.left +
    root.scrollLeft +
    ph.progress * beatRect.width;
  const top = beatRect.top - rootRect.top + root.scrollTop - head;
  style.value = {
    display: "block",
    left: `${left}px`,
    top: `${top}px`,
    height: `${Math.max(beatRect.height, 120) + head}px`,
  };
}

function followPlayhead() {
  const ph = store.playhead;
  if (!ph || dragging.value) return;
  const beatEl = document.querySelector(
    `[data-playhead-beat="${ph.barOrder}-${ph.beatOrder}"]`
  );
  if (!beatEl) return;
  const beatRect = beatEl.getBoundingClientRect();
  const x = beatRect.left + ph.progress * beatRect.width;
  const headerH = headerHeight();
  const followX = window.innerWidth * 0.36;
  const leftMargin = Math.max(72, window.innerWidth * 0.1);
  let dx = 0;
  if (store.isPlaying && x > followX) {
    dx = x - followX;
  } else if (x < leftMargin) {
    dx = x - leftMargin;
  } else if (!store.isPlaying) {
    const rightMargin = window.innerWidth * 0.28;
    if (x > window.innerWidth - rightMargin) {
      dx = x - (window.innerWidth - rightMargin);
    }
  }

  const viewTop = headerH;
  const viewBottom = window.innerHeight - headerH;
  let dy = 0;
  if (beatRect.bottom > viewBottom - 48) {
    dy = beatRect.bottom - (viewBottom - 48);
  } else if (beatRect.top < viewTop + 48) {
    dy = beatRect.top - (viewTop + 48);
  }
  if (dx || dy) {
    window.scrollBy(dx, dy);
  }
}

function seekAt(clientX, clientY) {
  const hit = findBeatAt(clientX, clientY);
  if (!hit) return;
  store.seekPlayback(hit.barOrder, hit.beatOrder, hit.progress);
}

function edgeScrollDuringDrag(clientX, clientY) {
  const edge = 56;
  let dx = 0;
  let dy = 0;
  if (clientX > window.innerWidth - edge) dx = 28;
  else if (clientX < edge) dx = -28;
  const headerH = headerHeight();
  if (clientY > window.innerHeight - headerH - 24) dy = 24;
  else if (clientY < headerH + 24) dy = -24;
  if (dx || dy) window.scrollBy(dx, dy);
}

function onPointerMove(event) {
  if (!dragging.value) return;
  seekAt(event.clientX, event.clientY);
  edgeScrollDuringDrag(event.clientX, event.clientY);
}

function onPointerUp() {
  dragging.value = false;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  if (resumeAfterDrag.value) {
    resumeAfterDrag.value = false;
    store.playPlayback();
  }
}

function onHandlePointerDown(event) {
  event.preventDefault();
  event.stopPropagation();
  dragging.value = true;
  resumeAfterDrag.value = store.isPlaying;
  if (store.isPlaying) store.pausePlayback();
  seekAt(event.clientX, event.clientY);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}

let raf = null;
function tick() {
  if (store.isPlaying || store.playhead || dragging.value) {
    updatePosition();
    if (store.isPlaying) followPlayhead();
  }
  raf = requestAnimationFrame(tick);
}

watch(
  () => [store.playhead, store.isPlaying],
  () => {
    updatePosition();
    if (!store.isPlaying && store.playhead && !dragging.value) {
      followPlayhead();
    }
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener("resize", updatePosition);
  raf = requestAnimationFrame(tick);
  updatePosition();
});

onUnmounted(() => {
  window.removeEventListener("resize", updatePosition);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  if (raf) cancelAnimationFrame(raf);
});

const isActiveBeat = computed(() => {
  const ph = store.playhead;
  return ph ? `${ph.barOrder}-${ph.beatOrder}` : "";
});

void isActiveBeat;
</script>

<template lang="pug">
div.playhead-root(ref="rootRef")
  div.playhead-line(:style="style" :class="{ dragging: dragging }")
    button.playhead-handle(
      type="button"
      tabindex="-1"
      aria-label="Переместить курсор воспроизведения"
      @pointerdown="onHandlePointerDown"
    )
</template>

<style scoped>
.playhead-root {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 250;
  overflow: visible;
}
.playhead-line {
  position: absolute;
  width: 2px;
  margin-left: -1px;
  background: rgb(131, 38, 251);
  box-shadow: 0 0 4px rgba(131, 38, 251, 0.45);
  pointer-events: none;
}
.playhead-line.dragging {
  background: rgb(111, 0, 255);
}
.playhead-handle {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: ew-resize;
  pointer-events: auto;
  touch-action: none;
}
.playhead-handle::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid rgb(131, 38, 251);
}
.playhead-line.dragging .playhead-handle::before {
  border-top-color: rgb(111, 0, 255);
}
</style>
