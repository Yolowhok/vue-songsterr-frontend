import { useCompositionStore } from "@/entities/composition";

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

function isTypingInField(event) {
  const el = event.target;
  if (!el || typeof el.closest !== "function") return false;
  // Overlay fret input on a cell: let the input handle digits; arrows handled in NoteV2.
  if (el.classList?.contains("overlay-input") || el.closest(".overlay-input")) {
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

/**
 * Arrow grid + fret digits + Backspace. Call on editor page mount.
 * @returns {() => void} unbind
 */
export function bindEditorNavigationHotkeys() {
  const nav = useEditorCursor();
  const store = useCompositionStore();

  const onKeyDown = (event) => {
    if (!store.getEditModeStatus) return;
    if (event.metaKey || event.ctrlKey) return;
    if (isTypingInField(event)) return;
    if (isRouteModalOpen()) return;

    const key = event.key;

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
