import { HABITS } from './resultsCopy'

/**
 * "How I Read" — the Phil-IRI behaviour flags, framed as habits to build
 * (SRS NFR-U3). Each row has an icon, a status word and a tip — never colour alone.
 */
export function HowIRead({ result }) {
  return (
    <section>
      <h2 className="mx-1 text-[21px] font-black">How I Read</h2>
      <p className="mx-1 mb-3 text-[15px] font-semibold text-ink-soft">Lumi watched how you read today.</p>
      <ul className="flex flex-col gap-2.5">
        {HABITS.map((h) => {
          const seen = !!result[h.key]
          return (
            <li key={h.key} className="flex items-start gap-3 rounded-[20px] border-[1.5px] border-[#f0d8d2] bg-white p-3.5">
              <span
                aria-hidden="true"
                className={`flex size-9 flex-none items-center justify-center rounded-full text-lg font-black text-white ${
                  seen ? 'bg-amber' : 'bg-mint-ink'
                }`}
              >
                {seen ? '+' : '✓'}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-black">{h.name}</span>
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-black ${
                      seen ? 'bg-[#fff3dd] text-[#8a6410]' : 'bg-mint-soft text-mint-ink'
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
