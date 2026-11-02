/**
 * Peach sticker-style page used across the reading flow: full-height on
 * phones, a rounded framed column on larger screens. `className` adds to the
 * inner column (e.g. extra top padding).
 */
export function StickerPage({ children, className = '' }) {
  return (
    <div className="min-h-dvh bg-level-card font-display text-ink sm:bg-divider sm:py-6">
      <div
        className={`relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col overflow-clip bg-level-card px-4.5 pb-7 sm:min-h-0 sm:rounded-[32px] sm:border-[3px] sm:border-level-edge ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
