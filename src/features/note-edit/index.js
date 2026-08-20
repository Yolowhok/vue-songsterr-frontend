import { useCompositionStore } from "@/entities/composition";

export function useNoteEdit() {
  const store = useCompositionStore();
  return {
    addNote: store.addNote.bind(store),
    deleteNote: store.deleteNote.bind(store),
    updateNoteValue: store.updateNoteValue.bind(store),
  };
}
