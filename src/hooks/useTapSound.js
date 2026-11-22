// useTapSound.js — plays a short sound whenever the learner taps a button.
//
// useTapSound()          — mount once (App.jsx). Listens for clicks on the whole
//                          document, so every button, button-like element and
//                          link gets the sound without touching each component.
// useMuteTapSound(muted) — call from any screen while the mic is listening
//                          (the /quality-check noise check, recording on
//                          /session). The tap sound would otherwise be picked
//                          up by the noise check or end up in the recording.
// useTapSoundVolume()    — the learner's volume setting (ProfileMenu →
//                          SoundSettings). 0 = off. Saved per device in
//                          localStorage — a UI preference, not assessment data.
//
// useSoundEffect(url)    — any other one-off sound (e.g. the results cheer).
//                          Returns a play() function. Uses Web Audio, which
//                          every tap unlocks, so it can play later without a
//                          tap of its own — e.g. when /results opens on its own
//                          after the analysis. Follows the same volume + mutes.
//
// Opt a single element out with `data-no-tap-sound` (e.g. the button that
// starts recording, so the sound isn't captured at the start of the take).
import { useCallback, useEffect, useSyncExternalStore } from 'react'

const SOUND_URL = '/sounds/button-tap.ogg'

/** One-off sound effects for useSoundEffect (files in public/sounds/). */
export const SOUNDS = {
  resultsReveal: '/sounds/results-reveal.mp3', // cheer when /results first appears
}
const STORAGE_KEY = 'readright.tapSoundVolume'
const DEFAULT_VOLUME = 0.5
const TAPPABLE = 'button, [role="button"], a[href]'

// How many mounted screens currently want silence. A counter (not a boolean)
// so two overlapping screens can't unmute each other.
let muteCount = 0

// One shared <audio> element, created on first use.
let audio = null
function getAudio() {
  if (!audio) {
    audio = new Audio(SOUND_URL)
    audio.preload = 'auto'
  }
  return audio
}

// ── Volume store (shared by every component that shows or changes it) ──────

function clampVolume(value) {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : DEFAULT_VOLUME
}

function readStoredVolume() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw === null ? DEFAULT_VOLUME : clampVolume(raw)
  } catch {
    return DEFAULT_VOLUME // storage blocked (private mode etc.) — use the default
  }
}

let volume = readStoredVolume()
// What the speaker button restores when sounds are turned back on.
let lastAudibleVolume = volume > 0 ? volume : DEFAULT_VOLUME
const listeners = new Set()

function setVolume(next) {
  volume = clampVolume(next)
  if (volume > 0) lastAudibleVolume = volume
  try {
    localStorage.setItem(STORAGE_KEY, String(volume))
  } catch {
    // Not saved — the setting still applies until the page is reloaded.
  }
  listeners.forEach((notify) => notify())
}

function subscribe(notify) {
  listeners.add(notify)
  return () => listeners.delete(notify)
}

function getVolume() {
  return volume
}

function playTap() {
  if (muteCount > 0 || volume === 0) return
  const el = getAudio()
  el.volume = volume
  el.currentTime = 0
  // play() rejects if the browser blocks audio or can't decode the file —
  // a missing tap sound should never break the tap itself.
  el.play().catch(() => {})
}

// ── Other sound effects (Web Audio) ─────────────────────────────────────────
// Phones (iPhones especially) only let a page start sound from a tap. An
// AudioContext resumed during a tap stays unlocked, so a sound effect can
// play later on its own. Each file is fetched + decoded once and cached.

let audioContext = null
function getAudioContext() {
  if (!audioContext) {
    const Context = window.AudioContext || window.webkitAudioContext
    if (!Context) return null
    audioContext = new Context()
  }
  return audioContext
}

const decoded = new Map() // url → Promise<AudioBuffer | null>
function loadSound(url) {
  if (!decoded.has(url)) {
    const context = getAudioContext()
    decoded.set(
      url,
      !context
        ? Promise.resolve(null)
        : fetch(url)
            .then((res) => {
              if (!res.ok) throw new Error(`${url}: ${res.status}`)
              return res.arrayBuffer()
            })
            .then((data) => context.decodeAudioData(data))
            .catch(() => null), // a missing sound effect should never break the page
    )
  }
  return decoded.get(url)
}

async function playSoundEffect(url) {
  if (muteCount > 0 || volume === 0) return
  const context = getAudioContext()
  if (!context) return
  const buffer = await loadSound(url)
  if (!buffer) return
  if (context.state === 'suspended') {
    try {
      await context.resume() // fails quietly if no tap has unlocked sound yet
    } catch {
      return
    }
  }
  // Check again — the learner may have muted, or a mic check started, while it loaded.
  if (context.state !== 'running' || muteCount > 0 || volume === 0) return
  const source = context.createBufferSource()
  source.buffer = buffer
  const gain = context.createGain()
  gain.gain.value = volume
  source.connect(gain).connect(context.destination)
  source.start()
}

// ── Hooks ───────────────────────────────────────────────────────────────────

export function useTapSound() {
  useEffect(() => {
    getAudio() // start loading the file before the first tap

    function handleClick(event) {
      // Every tap (even a muted one) unlocks Web Audio for useSoundEffect.
      const context = getAudioContext()
      if (context?.state === 'suspended') context.resume().catch(() => {})

      const target = event.target instanceof Element ? event.target.closest(TAPPABLE) : null
      if (!target) return
      if (target.closest('[data-no-tap-sound]')) return
      if (target.getAttribute('aria-disabled') === 'true') return
      playTap()
    }

    // Capture phase so the sound plays even if a handler stops propagation.
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])
}

export function useMuteTapSound(muted) {
  useEffect(() => {
    if (!muted) return
    muteCount += 1
    return () => {
      muteCount -= 1
    }
  }, [muted])
}

/**
 * A one-off sound effect. Starts loading the file when the component mounts
 * and returns a stable play() function (safe to call before it has loaded —
 * it plays once ready).
 */
export function useSoundEffect(url) {
  useEffect(() => {
    loadSound(url)
  }, [url])
  return useCallback(() => {
    playSoundEffect(url)
  }, [url])
}

export function useTapSoundVolume() {
  const current = useSyncExternalStore(subscribe, getVolume)
  return {
    volume: current,
    setVolume,
    // Speaker button: off → back to the last volume the learner picked.
    toggleOff: () => setVolume(volume > 0 ? 0 : lastAudibleVolume),
    // Play the sound once at the current volume (after changing it).
    preview: playTap,
  }
}
