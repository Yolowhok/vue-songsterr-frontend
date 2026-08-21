import { useCompositionStore } from "@/entities/composition";

export function useBeatEdit() {
  const store = useCompositionStore();
  return {
    addBeat: store.addBeat.bind(store),
    deleteBeat: store.deleteBeat.bind(store),
    setDurationForBeat: store.setDurationForBeat.bind(store),
    updateDurationForBeat: store.updateDurationForBeat.bind(store),
    toggleBeatDotted: store.toggleBeatDotted.bind(store),
    toggleBeatRest: store.toggleBeatRest.bind(store),
    toggleBeatTuplet: store.toggleBeatTuplet.bind(store),
    toggleNoteTiedAtCursor: store.toggleNoteTiedAtCursor.bind(store),
    setNoteTechniqueAtCursor: store.setNoteTechniqueAtCursor.bind(store),
    checkDurations: store.checkDurations.bind(store),
    checkAllDurations: store.checkAllDurations.bind(store),
  };
}
