// RecordingStatus.jsx — what the learner sees beside the camera bubble while a
// session records (Figma "Reading Session" redesign).
//
// Presentational only. Normally a blinking "Recording 0:42" pill; when a live
// GO1 check is failing (from useRecordingMonitor), it swaps to a short tip that
// says what to fix, so the learner can recover before the take is discarded.
// State is conveyed by text (and the bubble's ✓ / ! badge), never colour alone.
export function RecordingStatus({ elapsed, problem }) {
  if (problem) {
    return (
      <p role="status" className="flex-1 rounded-[18px] bg-peach px-3.5 py-2.5 text-[15px] font-extrabold text-ink">
        {problem}
      </p>
    )
  }

  return (
    <div role="status" className="flex items-center gap-2 rounded-full bg-coral-soft px-3.5 py-2">
      <span aria-hidden="true" className="size-2.5 animate-pulse rounded-full bg-coral" />
      <span className="text-[15px] font-extrabold text-ink">Recording</span>
      <span className="text-[15px] font-bold tabular-nums text-ink-muted">{elapsed}</span>
    </div>
  )
}
