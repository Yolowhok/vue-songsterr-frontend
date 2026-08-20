import { useCompositionStore } from "@/entities/composition";

export function useEditorSettings() {
  const store = useCompositionStore();
  return {
    toggleOrientation: store.toggleOrientation.bind(store),
    changeEditModeStatus: store.changeEditModeStatus.bind(store),
    getOrientation: () => store.getOrientation,
    getEditModeStatus: () => store.getEditModeStatus,
  };
}
