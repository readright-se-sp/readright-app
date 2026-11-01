import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[ReadRight] Missing Supabase env vars. ' +
    'Copy .env.example → .env.local and fill in your values from RR-001.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    // Session persists across reloads/tab restarts so a learner stays signed in
    // (UX decision — supersedes the old "memory-only JWT" rule, NFR-S3). The SDK
    // stores the token in localStorage by default; we let it own that storage and
    // do NOT hand-roll any token persistence. Trade-off: a localStorage token is
    // readable by page scripts (XSS exposure). httpOnly cookies are not an option
    // for this serverless SPA, so this is an accepted, deliberate trade-off.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
})

