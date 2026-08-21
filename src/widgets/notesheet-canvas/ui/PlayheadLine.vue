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
    const dist =
      Math.abs(clientX - midX) +
      Math.abs(clientY - (r.top + r.height / 2)) * 0.25;
    if (dist < nearestDist) {
      nearestDist = dist;
      const progress =
        r.width > 0 ? clamp((clientX - r.left) / r.width, 0, 1) : 0;
      nearest = { barOrder, beatOrder, progress };
    }
  }
  return nearest;
}

const HEAD = 36;
const ROW_JUMP_Y = 80;
const BACK_JUMP_X = 120;
/** Exponential follow: base rate + gain * |error|; soft max speed */
const FOLLOW_BASE = 6.5;
const FOLLOW_GAIN = 0.012;
const FOLLOW_MAX_SPEED = 2200;

let lastBarOrder = null;
let lastDocY = null;
let lastDocX = null;
/** Line position while crossing gutter (doc coords). Null = stick to live beat. */
let gutterLine = null;
let lastTickTs = null;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function playheadTarget() {
  const ph = store.playhead;
  const root = rootRef.value?.parentElement;
  if (!ph || !root || store.getEditModeStatus) return null;
  const beatEl = document.querySelector(
    `[data-playhead-beat="${ph.barOrder}-${ph.beatOrder}"]`
  );
  if (!beatEl) return null;
  const beatRect = beatEl.getBoundingClientRect();
  const docX =
    beatRect.left + window.scrollX + ph.progress * beatRect.width;
  const docY = beatRect.top + window.scrollY;
  return {
    ph,
    root,
    beatEl,
    beatRect,
    docX,
    docY,
    height: Math.max(beatRect.height, 120) + HEAD,
    barOrder: ph.barOrder,
    beatOrder: ph.beatOrder,
  };
}

function applyStyle(docX, docY, height, root) {
  const rootRect = root.getBoundingClientRect();
  const rootDocX = rootRect.left + window.scrollX;
  const rootDocY = rootRect.top + window.scrollY;
  style.value = {
    display: "block",
    left: `${docX - rootDocX + root.scrollLeft}px`,
    top: `${docY - rootDocY + root.scrollTop - HEAD}px`,
    height: `${height}px`,
  };
}

/** Delta to move scroll so playhead sits at lock-point. */
function cameraDeltaFor(t) {
  const x = t.beatRect.left + t.ph.progress * t.beatRect.width;
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
  if (t.beatRect.bottom > viewBottom - 48) {
    dy = t.beatRect.bottom - (viewBottom - 48);
  } else if (t.beatRect.top < viewTop + 48) {
    dy = t.beatRect.top - (viewTop + 48);
  }
  return { dx, dy };
}

/**
 * Continuous exponential camera follow: speed grows with lag.
 * No discrete pans / full-error scrollBy.
 */
function followCamera(dtSec) {
  if (!store.isPlaying || store.getEditModeStatus || dragging.value) {
    return;
  }
  const t = playheadTarget();
  if (!t) return;
  const { dx, dy } = cameraDeltaFor(t);
  const errMag = Math.hypot(dx, dy);
  if (errMag < 0.35) return;

  const dt = clamp(dtSec, 0.001, 0.05);
  const lambda = FOLLOW_BASE + FOLLOW_GAIN * errMag;
  let alpha = 1 - Math.exp(-lambda * dt);
  // Soft max speed so row jumps don't teleport
  const maxStep = FOLLOW_MAX_SPEED * dt;
  let stepX = dx * alpha;
  let stepY = dy * alpha;
  const stepMag = Math.hypot(stepX, stepY);
  if (stepMag > maxStep && stepMag > 0) {
    const s = maxStep / stepMag;
    stepX *= s;
    stepY *= s;
  }
  window.scrollTo(
    Math.max(0, window.scrollX + stepX),
    Math.max(0, window.scrollY + stepY)
  );
}

function beginGutterLine(fromDoc, to) {
  const dist = Math.hypot(to.docX - fromDoc.x, to.docY - fromDoc.y);
  gutterLine = {
    t0: performance.now(),
    dur: clamp(dist * 0.4, 120, 180),
    fromX: fromDoc.x,
    fromY: fromDoc.y,
    toX: to.docX,
    toY: to.docY,
    height: to.height,
    root: to.root,
  };
}

function stepGutterLine(now) {
  if (!gutterLine) return false;
  const u = Math.min(1, (now - gutterLine.t0) / gutterLine.dur);
  const e = easeOutCubic(u);
  const docX = gutterLine.fromX + (gutterLine.toX - gutterLine.fromX) * e;
  const docY = gutterLine.fromY + (gutterLine.toY - gutterLine.fromY) * e;
  applyStyle(docX, docY, gutterLine.height, gutterLine.root);
  lastDocX = docX;
  lastDocY = docY;
  if (u >= 1) gutterLine = null;
  return true;
}

function isNewRow(prevX, prevY, t) {
  if (prevY == null) return false;
  if (Math.abs(t.docY - prevY) > ROW_JUMP_Y) return true;
  if (prevX != null && t.docX < prevX - BACK_JUMP_X) return true;
  return false;
}

function updatePosition() {
  const t = playheadTarget();
  if (!t) {
    style.value = { display: "none" };
    lastBarOrder = null;
    lastDocX = null;
    lastDocY = null;
    gutterLine = null;
    return;
  }

  if (gutterLine) {
    applyStyle(
      lastDocX ?? t.docX,
      lastDocY ?? t.docY,
      t.height,
      t.root
    );
    return;
  }

  const barChanged = lastBarOrder != null && t.barOrder !== lastBarOrder;
  if (store.isPlaying && !dragging.value && barChanged) {
    if (isNewRow(lastDocX, lastDocY, t)) {
      // Snap line to new row; camera catches up via followCamera lag
      applyStyle(t.docX, t.docY, t.height, t.root);
      lastBarOrder = t.barOrder;
      lastDocX = t.docX;
      lastDocY = t.docY;
      return;
    }
    beginGutterLine(
      { x: lastDocX ?? t.docX, y: lastDocY ?? t.docY },
      t
    );
    lastBarOrder = t.barOrder;
    return;
  }

  applyStyle(t.docX, t.docY, t.height, t.root);
  lastBarOrder = t.barOrder;
  lastDocX = t.docX;
  lastDocY = t.docY;
}

function seekAt(clientX, clientY) {
  if (store.getEditModeStatus) return;
  gutterLine = null;
  lastBarOrder = null;
  lastDocX = null;
  lastDocY = null;
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
  if (store.getEditModeStatus) return;
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
function tick(now) {
  const n = now || performance.now();
  const dtSec =
    lastTickTs == null ? 1 / 60 : (n - lastTickTs) / 1000;
  lastTickTs = n;

  if (store.isPlaying || store.playhead || dragging.value) {
    if (gutterLine) {
      stepGutterLine(n);
      const t = playheadTarget();
      if (t && gutterLine) {
        gutterLine.toX = t.docX;
        gutterLine.toY = t.docY;
        gutterLine.height = t.height;
        gutterLine.root = t.root;
      }
    } else {
      updatePosition();
    }
    // Camera always follows continuously while playing (even during gutter)
    if (store.isPlaying && !dragging.value) {
      followCamera(dtSec);
      // Re-stick line after scroll so it stays on beat
      if (!gutterLine) updatePosition();
      else {
        const t = playheadTarget();
        if (t) {
          applyStyle(
            lastDocX ?? t.docX,
            lastDocY ?? t.docY,
            t.height,
            t.root
          );
        }
      }
    }
  } else {
    lastTickTs = null;
  }
  raf = requestAnimationFrame(tick);
}

watch(
  () => [store.playhead, store.isPlaying, store.getEditModeStatus],
  () => {
    if (!gutterLine) updatePosition();
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
  will-change: left, top;
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
