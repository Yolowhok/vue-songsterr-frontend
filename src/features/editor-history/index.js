import { useCompositionStore } from "@/entities/composition";

export function useEditorHistory() {
  const store = useCompositionStore();
  return {
    get canUndo() {
      return store.canUndo;
    },
    get canRedo() {
      return store.canRedo;
    },
    undo: () => store.undo(),
    redo: () => store.redo(),
  };
}

export function bindEditorHistoryHotkeys() {
  const history = useEditorHistory();
  const onKeyDown = (event) => {
    const mod = event.metaKey || event.ctrlKey;
    if (!mod) return;
    const key = event.key.toLowerCase();
    if (key === "z" && !event.shiftKey) {
      event.preventDefault();
      history.undo();
    } else if ((key === "z" && event.shiftKey) || key === "y") {
      event.preventDefault();
      history.redo();
    } else if (key === "s") {
      event.preventDefault();
      useCompositionStore().saveCompositionNow();
    }
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}
