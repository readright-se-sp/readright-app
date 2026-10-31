import { LogoMark } from '../icons'

/**
 * ProcessingScreen — "Analyzing your reading…" shown on /session while the
 * recording is uploaded and scored (useAnalyzeSubmit 'submitting', plus the
 * brief "Done" flash on 'success' before navigating to /results).
 *
 * Pure UI: SessionScreen owns the cosmetic step timer and passes the current
 * step. `steps` is the ordered list of step labels; `step` is the index of the
 * active one (all earlier steps render as done).
 */
export function ProcessingScreen({ steps, step }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-page font-display">
      <header className="bg-header">
        <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="text-[20px] font-extrabold text-brand">ReadRight</span>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
        {/* Top reassurance banner */}
        <div className="flex items-start gap-3 rounded-[12px] bg-brand/5 px-4 py-3">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-soft text-[12px] font-bold text-white" aria-hidden="true">
            i
          </span>
          <p className="text-[14px] leading-[20px] text-ink-soft">
            Still working — this can take up to 2 minutes. Please don't close the app.
          </p>
        </div>

        {/* Center: heading + step progress */}
        <div className="flex flex-1 flex-col justify-center py-8">
          <h2 className="text-center text-[24px] font-extrabold text-ink">
            Analyzing your reading…
          </h2>
          <p className="mt-2 text-center text-[16px] leading-[24px] text-ink-soft">
            This usually takes less than a minute. Please wait.
          </p>

          {/* Stepper — circles joined by connectors; state by icon + colour */}
          <ol className="mt-8 flex w-full items-start" aria-live="polite">
            {steps.map((label, i) => {
              const done = i < step
              const active = i === step
              const last = i === steps.length - 1
              return (
                <li key={label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full items-center">
                    <span className={`h-[3px] flex-1 rounded-full ${i === 0 ? 'opacity-0' : done || active ? 'bg-goal' : 'bg-card-border'}`} />
                    {done ? (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-goal text-[14px] font-bold text-white">
                        ✓
                      </span>
                    ) : active ? (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-[3px] border-brand bg-white">
                        <span className="size-2.5 rounded-full bg-brand" />
                      </span>
                    ) : (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card-border">
                        <span className="size-2 rounded-full bg-white/70" />
                      </span>
                    )}
                    <span className={`h-[3px] flex-1 rounded-full ${last ? 'opacity-0' : done ? 'bg-goal' : 'bg-card-border'}`} />
                  </div>
                  <span
                    className={`text-center text-[11px] font-bold uppercase tracking-[0.04em] ${
                      active ? 'text-brand' : done ? 'text-goal' : 'text-ink-muted'
                    }`}
                  >
                    {label}{last ? '!' : ''}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Bottom warning banner + footer */}
        <div className="flex items-start gap-3 rounded-[12px] bg-brand/5 px-4 py-3">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white" aria-hidden="true">
            i
          </span>
          <p className="text-[14px] leading-[20px] text-ink">
            Do not close this screen while your reading is being analyzed.
          </p>
        </div>

        <p className="mt-4 text-center text-[12px] text-ink-muted">
          Powered by Phil-IRI Assessment Engine
        </p>
      </div>
    </div>
  )
}
