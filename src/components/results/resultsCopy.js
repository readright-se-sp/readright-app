import { miscueKeys } from '../../lib/philIri'

// Learner-facing copy + colours for the results page. Keys match the flat
// /analyze response (lib/api.js): reading_level, miscue counts, behaviour flags.

// Words-per-minute goal shown on the speed track (Grade 4 Phil-IRI target).
export const GOAL_WPM = 80
// Right end of the speed track: the goal sits about ¾ along, and anyone
// faster than this simply reaches the end.
export const MAX_WPM = 110

// Reading Aloud Score: the level pill, the text colour, and the bold gingham
// card (`tile`) with its deep outline colour (`deep`) and ledges. `card` /
// `ledge` are the softer pastel versions. `ring` circles the score (an
// Independent score has the gold one instead) and `scoreFace` colours the
// circle inside it. Same green / blue / amber as the dashboard's level faces
// (dashboardCopy LEVEL_FACES). No red: Frustration uses amber.
export const READING_LEVELS = {
  Independent: {
    card: 'bg-result-green', ledge: 'shadow-ledge-green', badge: 'bg-goal', ink: 'text-goal',
    tile: 'bg-score-green', deep: 'border-score-green-deep', tileLedge: 'shadow-[0_6px_0_var(--color-score-green-deep)]', stickerLedge: 'shadow-[0_4px_0_var(--color-score-green-deep)]', scoreFace: 'bg-sticker text-goal',
    message: 'You read the story all by yourself! You are ready for harder stories.',
  },
  Instructional: {
    card: 'bg-result-blue', ledge: 'shadow-ledge-blue', badge: 'bg-tile-blue', ink: 'text-tile-blue-ink',
    tile: 'bg-tile-blue', deep: 'border-tile-blue-deep', tileLedge: 'shadow-tile-blue', stickerLedge: 'shadow-sticker-blue', ring: 'bg-[conic-gradient(from_20deg,var(--color-score-silver),var(--color-score-silver-shine)_12%,var(--color-score-silver)_26%,var(--color-score-silver)_50%,var(--color-score-silver-shine)_62%,var(--color-score-silver)_76%,var(--color-score-silver))]', scoreFace: 'bg-tile-blue-ink text-white',
    message: 'You read most of the story well! Keep practicing to reach Independent.',
  },
  Frustration: {
    card: 'bg-shelf-card', ledge: 'shadow-ledge-yellow', badge: 'bg-result-olive', ink: 'text-result-olive',
    tile: 'bg-score-amber', deep: 'border-score-amber-deep', tileLedge: 'shadow-[0_6px_0_var(--color-score-amber-deep)]', stickerLedge: 'shadow-[0_4px_0_var(--color-score-amber-deep)]', ring: 'bg-[conic-gradient(from_20deg,var(--color-score-bronze),var(--color-score-bronze-shine)_12%,var(--color-score-bronze)_26%,var(--color-score-bronze)_50%,var(--color-score-bronze-shine)_62%,var(--color-score-bronze)_76%,var(--color-score-bronze))]', scoreFace: 'bg-sticker text-result-olive',
    message: 'This story was a bit hard. Keep practicing — you’ll get there!',
  },
}

// comprehension_level (1–3) → "Did you understand the story?" face + message.
// `face` fills the face, `mouth` is 'smile' or 'grin'.
export const COMPREHENSION = {
  1: { title: 'Keep Going!', message: 'Let’s read it again together — you’ll understand even more!', face: 'fill-track-yellow', mouth: 'smile', ink: 'text-result-olive' },
  2: { title: 'Good Job!', message: 'You understood a lot of the story!', face: 'fill-result-face-blue', mouth: 'grin', ink: 'text-tile-blue-ink' },
  3: { title: 'Super Reader!', message: 'You understood the story really well!', face: 'fill-result-face-green', mouth: 'grin', ink: 'text-goal' },
}

// "Word Detective" boxes, one per Phil-IRI miscue type. The keys and their order
// come from lib/philIri.js (miscueKeys) — the same list the dashboard uses — so
// the two can't drift apart. `said` / `fix` label the two halves of the
// word-review sheet. `card` + `dot` colour the box; `border` + `ink` the sheet.
const MISCUE_COPY = {
  mispronunciation: { name: 'Said it differently', desc: 'Words that sounded a bit off', said: 'You said', fix: 'Say it like this',
    dot: 'bg-coral', card: 'bg-word-pink', ledge: 'shadow-[0_5px_0_var(--color-word-pink-edge)]', edge: 'border-word-pink-edge', border: 'border-[#f6c4be]', ink: 'text-brand' },
  substitution: { name: 'Swapped words', desc: 'You read a different word', said: 'You read', fix: 'The story says',
    dot: 'bg-amber', card: 'bg-word-yellow', ledge: 'shadow-[0_5px_0_var(--color-word-yellow-edge)]', edge: 'border-word-yellow-edge', border: 'border-[#f3d58e]', ink: 'text-[#8a6410]' },
  omission: { name: 'Skipped words', desc: 'Words you jumped over', said: 'You skipped', fix: 'Read it with the word',
    dot: 'bg-tile-blue', card: 'bg-word-blue', ledge: 'shadow-[0_5px_0_var(--color-word-blue-edge)]', edge: 'border-word-blue-edge', border: 'border-[#c6d3f4]', ink: 'text-[#3e5ba8]' },
  insertion: { name: 'Added words', desc: 'Extra words not in the story', said: 'You added', fix: 'The story says',
    dot: 'bg-lilac', card: 'bg-word-lilac', ledge: 'shadow-[0_5px_0_var(--color-word-lilac-edge)]', edge: 'border-word-lilac-edge', border: 'border-[#d8cbf2]', ink: 'text-lilac-ink' },
  repetition: { name: 'Said it twice', desc: 'Words you read again', said: 'You said', fix: 'Just say it once',
    dot: 'bg-tile-pink', card: 'bg-word-pink', ledge: 'shadow-[0_5px_0_var(--color-word-pink-edge)]', edge: 'border-word-pink-edge', border: 'border-[#f6c4be]', ink: 'text-brand' },
  refusal_to_pronounce: { name: 'Needed help', desc: 'Words you weren’t sure of', said: 'Tricky word', fix: 'Say it like this',
    dot: 'bg-mint-ink', card: 'bg-word-green', ledge: 'shadow-[0_5px_0_var(--color-word-green-edge)]', edge: 'border-word-green-edge', border: 'border-[#b5dcc2]', ink: 'text-mint-ink' },
}

export const MISCUE_TYPES = miscueKeys.map((key) => ({ key, ...MISCUE_COPY[key] }))

// "How I Read" — Phil-IRI behaviour flags. Each flag is true when the habit was
// observed (something to work on); false shows the "Great!" copy.
export const HABITS = [
  { key: 'finger_pointing', name: 'Using my finger', seenStatus: 'Noticed',
    seen: 'Your finger helped you follow along. Next time, try with just your eyes!',
    notSeen: 'You followed along with just your eyes.' },
  { key: 'loss_of_place', name: 'Staying on track', seenStatus: 'Let’s practice',
    seen: 'You lost your place a few times. Try reading at a steady pace.',
    notSeen: 'You never got lost in the story.' },
  { key: 'monotone_reading', name: 'Reading with feeling', seenStatus: 'Let’s practice',
    seen: 'Make your voice go up and down, like telling a story to a friend.',
    notSeen: 'Your voice went up and down, just like a storyteller!' },
  { key: 'word_by_word_reading', name: 'Smooth reading', seenStatus: 'Let’s practice',
    seen: 'Try reading words together in little groups, not one by one.',
    notSeen: 'Your words flowed together nicely, not one-by-one.' },
  { key: 'inaudible_reading', name: 'Loud and clear', seenStatus: 'Let’s practice',
    seen: 'Try reading a little louder so every word can be heard.',
    notSeen: 'Your voice was easy to hear the whole time.' },
]
