import { DashboardCard, WeekTile } from './DashboardParts'

/**
 * A four-week row of face tiles — used for "My reading level" and "Did you
 * understand the stories?". `weeks` = [{ label, face }] where face is null for
 * a week with no reading. `children` replaces the row (e.g. a Coming soon box).
 */
export function WeeklyFacesCard({ title, weeks, children }) {
  return (
    <DashboardCard title={title}>
      {children || (
        <ul className="grid grid-cols-4 gap-2">
          {weeks.map((w) => (
            <li key={w.label}>
              <WeekTile face={w.face} week={w.label} />
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}
