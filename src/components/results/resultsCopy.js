import { miscueKeys } from '../../lib/philIri'

// Learner-facing copy + colours for the results page. Keys match the flat
// /analyze response (lib/api.js): reading_level, miscue counts, behaviour flags.

// Words-per-minute goal shown on the speed track (Grade 4 Phil-IRI target).
export const GOAL_WPM = 80
// Right end of the speed track.
export const MAX_WPM = 150

export const READING_LEVELS = {
  Independent: { badge: 'bg-goal', message: 'You read the story all by yourself! You are ready for harder stories.' },
  Instructional: { badge: 'bg-goal', message: 'You read most of the story well! Keep practicing to reach Independent.' },
  Frustration: { badge: 'bg-brand', message: 'This story was a bit hard. Keep practicing — you’ll get there!' },
}

// comprehension_level (1–3) → "Did you understand the story?" face + message.
export const COMPREHENSION = {
  1: { title: 'Keep Going!', message: 'Let’s read it again together — you’ll understand even more!', card: 'bg-[#fff3dd]', ink: 'text-[#8a6410]' },
  2: { title: 'Good Job!', message: 'You understood a lot of the story!', card: 'bg-sky-soft', ink: 'text-[#3e5ba8]' },
  3: { title: 'Super Reader!', message: 'You understood the story really well!', card: 'bg-mint-soft', ink: 'text-mint-ink' },
}

// "Word Detective" boxes, one per Phil-IRI miscue type. The keys and their order
// come from lib/philIri.js (miscueKeys) — the same list the dashboard uses — so
// the two can't drift apart. `said` / `fix` label the two halves of the
// word-review sheet.
const MISCUE_COPY = {
  mispronunciation: { name: 'Said it differently', desc: 'Words that sounded a bit off', said: 'You said', fix: 'Say it like this',
    dot: 'bg-coral', card: 'bg-coral-soft', border: 'border-[#f6c4be]', ink: 'text-brand' },
  substitution: { name: 'Swapped words', desc: 'You read a different word', said: 'You read', fix: 'The story says',
    dot: 'bg-amber', card: 'bg-[#fff3dd]', border: 'border-[#f3d58e]', ink: 'text-[#8a6410]' },
  omission: { name: 'Skipped words', desc: 'Words you jumped over', said: 'You skipped', fix: 'Read it with the word',
    dot: 'bg-sky', card: 'bg-sky-soft', border: 'border-[#c6d3f4]', ink: 'text-[#3e5ba8]' },
  insertion: { name: 'Added words', desc: 'Extra words not in the story', said: 'You added', fix: 'The story says',
    dot: 'bg-lilac', card: 'bg-lilac-soft', border: 'border-[#d8cbf2]', ink: 'text-lilac-ink' },
  repetition: { name: 'Said it twice', desc: 'Words you read again', said: 'You said', fix: 'Just say it once',
    dot: 'bg-coral', card: 'bg-coral-soft', border: 'border-[#f6c4be]', ink: 'text-brand' },
  refusal_to_pronounce: { name: 'Needed help', desc: 'Words you weren’t sure of', said: 'Tricky word', fix: 'Say it like this',
    dot: 'bg-mint-ink', card: 'bg-mint-soft', border: 'border-[#b5dcc2]', ink: 'text-mint-ink' },
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
