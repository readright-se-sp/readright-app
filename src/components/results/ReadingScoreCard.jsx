import { READING_LEVELS } from './resultsCopy'

/** "Reading Aloud Score" — word recognition out of 100 + the Phil-IRI level. */
export function ReadingScoreCard({ score, readingLevel }) {
  const levelName = READING_LEVELS[readingLevel] ? readingLevel : 'Instructional'
  const level = READING_LEVELS[levelName]

  return (
    <section className="flex items-center gap-4 rounded-[24px] border-[1.5px] border-[#f0d8d2] bg-white p-4">
      <div className="flex size-[92px] flex-none flex-col items-center justify-center rounded-full border-[5px] border-coral bg-coral-soft">
        <span className="text-[32px] font-black leading-none text-brand">{Math.round(score)}</span>
        <span className="text-xs font-extrabold text-brand">out of 100</span>
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-[13px] font-black uppercase tracking-[0.06em] text-ink-soft">Reading Aloud Score</h2>
        <span className={`mt-0.5 self-start rounded-full px-3 py-1 text-[13px] font-black uppercase tracking-[0.06em] text-white ${level.badge}`}>
          {levelName}
        </span>
        <p className="text-[15px] font-bold leading-[1.3] text-ink-soft text-pretty">{level.message}</p>
      </div>
    </section>
  )
}
