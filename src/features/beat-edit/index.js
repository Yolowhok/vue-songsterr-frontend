import { useCompositionStore } from "@/entities/composition";

export function useBeatEdit() {
  const store = useCompositionStore();
  return {
    addBeat: store.addBeat.bind(store),
    deleteBeat: store.deleteBeat.bind(store),
    setDurationForBeat: store.setDurationForBeat.bind(store),
    updateDurationForBeat: store.updateDurationForBeat.bind(store),
    checkDurations: store.checkDurations.bind(store),
    checkAllDurations: store.checkAllDurations.bind(store),
  };
}
