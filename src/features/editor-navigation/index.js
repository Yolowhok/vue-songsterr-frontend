import { useCompositionStore } from "@/entities/composition";
import eventBus from "@/shared/lib/eventBus";

export function useEditorCursor() {
  const store = useCompositionStore();
  return {
    get cursor() {
      return store.cursor;
    },
    setCursor: (pos) => store.setCursor(pos),
    moveCursor: (dx, dy) => store.moveCursor(dx, dy),
    insertBarRight: () => store.insertBarRightAtCursor(),
    insertBarLeft: () => store.insertBarLeftAtCursor(),
    typeFret: (digit) => store.typeFretAtCursor(digit),
    clearNote: () => store.clearNoteAtCursor(),
  };
}

function isOverlayInput(event) {
  const el = event.target;
  if (!el || typeof el.closest !== "function") return false;
  return Boolean(
    el.classList?.contains("overlay-input") || el.closest(".overlay-input")
  );
}

function isTypingInField(event) {
  const el = event.target;
  if (!el || typeof el.closest !== "function") return false;
  // Overlay: digits stay in input; Enter/Esc go to window handlers (open/close panel).
  if (isOverlayInput(event)) {
    const key = event.key;
    if (key === "Enter" || key === "Escape") return false;
    return true;
  }
  if (el.closest("[data-tab-cell]")) return false;
  const tag = (el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  return false;
}

function isRouteModalOpen() {
  return Boolean(document.querySelector(".modal-overlay"));
}

function isBeatPanelOpen() {
  return Boolean(document.querySelector(".beat-popup-panel"));
}

/**
 * Arrow grid + fret digits + Backspace + Enter opens beat panel.
 * @returns {() => void} unbind
 */
export function bindEditorNavigationHotkeys() {
  const nav = useEditorCursor();
  const store = useCompositionStore();

  const onKeyDown = (event) => {
    if (!store.getEditModeStatus) return;
    if (event.metaKey || event.ctrlKey) return;
    if (isRouteModalOpen()) return;

    // Beat panel owns arrows / Enter / Esc while open.
    if (isBeatPanelOpen()) return;

    if (isTypingInField(event)) return;

    const key = event.key;

    if (key === "Enter") {
      event.preventDefault();
      const cursor = store.ensureCursor();
      if (!cursor) return;
      eventBus.emit("open-beat-panel", {
        barOrder: cursor.barOrder,
        beatOrder: cursor.beatOrder,
      });
      return;
    }

    if (key === "ArrowRight") {
      event.preventDefault();
      if (event.shiftKey) nav.insertBarRight();
      else nav.moveCursor(1, 0);
      return;
    }
    if (key === "ArrowLeft") {
      event.preventDefault();
      if (event.shiftKey) nav.insertBarLeft();
      else nav.moveCursor(-1, 0);
      return;
    }
    if (key === "ArrowDown") {
      event.preventDefault();
      nav.moveCursor(0, 1);
      return;
    }
    if (key === "ArrowUp") {
      event.preventDefault();
      nav.moveCursor(0, -1);
      return;
    }
    if (key === "Backspace" || key === "Delete") {
      event.preventDefault();
      nav.clearNote();
      return;
    }
    if (/^\d$/.test(key)) {
      event.preventDefault();
      nav.typeFret(key);
    }
  };

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}
