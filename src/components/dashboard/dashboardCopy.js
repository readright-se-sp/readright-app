// Learner-facing labels + colours for the dashboard faces. Every state pairs a
// colour with a face and a text label (never colour alone).

// reading_level → weekly tile / past-reading pill.
export const LEVEL_FACES = {
  Independent: { label: 'Reading on my own', mood: 'big', card: 'bg-mint-soft', border: 'border-mint', ink: 'text-mint-ink' },
  Instructional: { label: 'Getting there', mood: 'smile', card: 'bg-sky-soft', border: 'border-sky', ink: 'text-[#34508f]' },
  Frustration: { label: 'Still tricky', mood: 'flat', card: 'bg-coral-soft', border: 'border-coral', ink: 'text-[#b0302a]' },
}

// comprehension_level (1–3) → weekly tile. Matches the results-page wording.
export const COMPREHENSION_FACES = {
  1: { label: 'Keep going', mood: 'flat', stars: '★', card: 'bg-[#fdf3d8]', border: 'border-amber', ink: 'text-[#7d5400]' },
  2: { label: 'Good job', mood: 'smile', stars: '★★', card: 'bg-sky-soft', border: 'border-sky', ink: 'text-[#34508f]' },
  3: { label: 'Super reader', mood: 'big', stars: '★★★', card: 'bg-mint-soft', border: 'border-mint', ink: 'text-mint-ink' },
}

// Earned badge colours, by badge key (lib/dashboardStats → badges()).
export const BADGE_STYLES = {
  first: 'bg-peach border-amber text-[#7d5400]',
  streak3: 'bg-coral-soft border-coral text-[#b0302a]',
  own: 'bg-mint-soft border-mint text-mint-ink',
  streak7: 'bg-lilac-soft border-lilac text-lilac-ink',
}
