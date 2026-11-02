import { Star } from '../dashboard/DashboardParts'
import { HABITS } from './resultsCopy'
import { CheckIcon } from '../icons'

/**
 * "How I Read" — the Phil-IRI behaviour flags, framed as habits to build
 * (SRS NFR-U3). Each row is a sticker: yellow with a star when the habit was
 * noticed, green with a check when it went well — plus a status word and a
 * tip, never colour alone.
 */
export function HowIRead({ result }) {
  return (
    <section>
      <h2 className="mx-1 text-[26px] font-black text-level-ink">How I Read</h2>
      <p className="mx-1 mb-3.5 text-base font-bold text-level-muted">Lumi watched how you read today.</p>
      <ul className="flex flex-col gap-3">
        {HABITS.map((h) => {
          const seen = !!result[h.key]
          return (
            <li
              key={h.key}
              className={`flex items-start gap-3 rounded-[20px] p-3.5 ${
                seen ? 'bg-shelf-card shadow-ledge-yellow' : 'bg-result-green shadow-ledge-green'
              }`}
            >
              <span
                aria-hidden="true"
                className={`relative flex size-10 flex-none items-center justify-center rounded-full ${
                  seen ? 'bg-cta text-level-ink' : 'bg-mint text-white'
                }`}
              >
                {seen ? <Star className="inset-0 m-auto size-5" /> : <CheckIcon />}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[17px] font-black leading-tight">{h.name}</span>
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-0.5 text-[13px] font-black ${
                      seen ? 'bg-cta text-level-ink' : 'bg-goal text-white'
                    }`}
                  >
                    {seen ? h.seenStatus : 'Great!'}
                  </span>
                </div>
                <p className="text-[15px] font-semibold leading-[1.3] text-ink-soft text-pretty">{seen ? h.seen : h.notSeen}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
