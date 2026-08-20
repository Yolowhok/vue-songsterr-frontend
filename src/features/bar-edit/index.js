import { useCompositionStore } from "@/entities/composition";

export function useBarEdit() {
  const store = useCompositionStore();
  return {
    addBarLeft: store.addBarLeft.bind(store),
    addBarRight: store.addBarRight.bind(store),
    deleteBar: store.deleteBar.bind(store),
    updateBarSize: store.updateBarSize.bind(store),
  };
}
