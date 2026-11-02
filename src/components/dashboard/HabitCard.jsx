import { HABITS } from '../results/resultsCopy'

/**
 * One tip from Lumi, based on the habit seen most in recent readings
 * (`habitKey`, a behaviour-flag key), or praise when none was seen.
 */
export function HabitCard({ habitKey }) {
  const habit = HABITS.find((h) => h.key === habitKey)
  return (
    <section className="flex items-start gap-3.5 rounded-3xl border-2 border-card-border bg-peach p-4.5 shadow-card">
      <img src="/mascot-reading.svg" alt="" className="w-14 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[15px] font-black text-brand">{habit ? 'One habit to practice' : 'Lumi says'}</span>
        <p className="text-xl font-black leading-[1.3] text-pretty">
          {habit ? habit.seen : 'You read with feeling and at a steady pace. Great reading!'}
        </p>
        <p className="text-base text-ink-soft">{habit ? 'Try it in your next story.' : 'Keep it up in your next story.'}</p>
      </div>
    </section>
  )
}
