import { useCompositionStore } from "@/entities/composition";

export function useEditorPersistence() {
  const store = useCompositionStore();
  return {
    get isDirty() {
      return store.isDirty;
    },
    get isSaving() {
      return store.isSaving;
    },
    get lastSavedAt() {
      return store.lastSavedAt;
    },
    get saveError() {
      return store.saveError;
    },
    get statusLabel() {
      return store.saveStatusLabel;
    },
    saveNow: () => store.saveCompositionNow(),
    scheduleAutosave: () => store.scheduleAutosave(),
  };
}
