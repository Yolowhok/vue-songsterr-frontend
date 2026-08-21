/**
 * Build a flat playback timeline from a notesheet.
 * durationMs = (60 / bpm) * 4 * effectiveDurationValue * 1000 / playbackRate
 * effectiveDurationValue = durationValue * (dotted ? 1.5 : 1) * (tupletDen/tupletNum)
 */
function effectiveDurationValue(beat) {
  let v =
    beat?.duration?.durationValue != null
      ? Number(beat.duration.durationValue)
      : 0.25;
  if (beat?.dotted) v *= 1.5;
  const num = beat?.tupletNum;
  const den = beat?.tupletDen;
  if (num > 0 && den > 0) {
    v *= den / num;
  }
  return v;
}

export function buildTimeline(notesheet, playbackRate = 1) {
  const rate = playbackRate > 0 ? playbackRate : 1;
  const segments = [];
  let t = 0;
  const bars = [...(notesheet?.bars || [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );
  for (const bar of bars) {
    const bpm = bar.tempInBpm > 0 ? bar.tempInBpm : 120;
    const beats = [...(bar.beats || [])].sort(
      (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
    );
    for (const beat of beats) {
      const durationValue = effectiveDurationValue(beat);
      const durationMs =
        ((60 / bpm) * 4 * durationValue * 1000) / rate;
      segments.push({
        barOrder: bar.orderIndex,
        beatOrder: beat.orderIndex,
        startMs: t,
        durationMs: Math.max(1, durationMs),
        rest: Boolean(beat.rest),
      });
      t += Math.max(1, durationMs);
    }
  }
  return { segments, totalMs: t };
}

/**
 * Locate segment + progress for elapsedMs.
 * @returns {{ barOrder, beatOrder, startMs, durationMs, progress, ended, rest } | null}
 */
export function findSegmentAt(segments, elapsedMs) {
  if (!segments?.length) return null;
  const last = segments[segments.length - 1];
  const end = last.startMs + last.durationMs;
  if (elapsedMs >= end) {
    return {
      ...last,
      progress: 1,
      ended: true,
    };
  }
  for (const seg of segments) {
    const segEnd = seg.startMs + seg.durationMs;
    if (elapsedMs < segEnd) {
      const progress =
        seg.durationMs > 0
          ? (elapsedMs - seg.startMs) / seg.durationMs
          : 0;
      return {
        ...seg,
        progress: Math.min(1, Math.max(0, progress)),
        ended: false,
      };
    }
  }
  return {
    ...last,
    progress: 1,
    ended: true,
  };
}
