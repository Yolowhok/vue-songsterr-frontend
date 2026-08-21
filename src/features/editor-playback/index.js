import { useCompositionStore } from "@/entities/composition";

export function useEditorPlayback() {
  const store = useCompositionStore();
  return {
    get isPlaying() {
      return store.isPlaying;
    },
    get playhead() {
      return store.playhead;
    },
    get playbackRate() {
      return store.playbackRate;
    },
    play: () => store.playPlayback(),
    pause: () => store.pausePlayback(),
    stop: () => store.stopPlayback(),
    toggle: () => store.togglePlayback(),
    seek: (barOrder, beatOrder, progress) =>
      store.seekPlayback(barOrder, beatOrder, progress),
    setRate: (rate) => store.setPlaybackRate(rate),
  };
}

function isTypingInField(event) {
  const el = event.target;
  if (!el || typeof el.closest !== "function") return false;
  if (el.classList?.contains("overlay-input") || el.closest(".overlay-input")) {
    return true;
  }
  const tag = (el.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  return false;
}

function isRouteModalOpen() {
  return Boolean(document.querySelector(".modal-overlay"));
}

/**
 * Space = play/pause on editor page.
 * @returns {() => void} unbind
 */
export function bindEditorPlaybackHotkeys() {
  const playback = useEditorPlayback();

  const onKeyDown = (event) => {
    if (event.code !== "Space" && event.key !== " ") return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTypingInField(event)) return;
    if (isRouteModalOpen()) return;
    event.preventDefault();
    playback.toggle();
  };

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}
